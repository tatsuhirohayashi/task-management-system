#!/usr/bin/env python3
"""
PR の diff をファイルから読み、Gemini API でコードレビューし、結果を GitHub PR にコメントする。
diff をファイルで渡すことで、GitHub Actions の出力サイズ制限を回避する。
"""
import json
import os
import sys
import urllib.error
import urllib.request

CHUNK_SIZE = 3500
GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


def read_diff(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


def chunk_text(text: str, size: int) -> list[str]:
    chunks = []
    for i in range(0, len(text), size):
        chunks.append(text[i : i + size])
    return chunks


def call_gemini(api_key: str, prompt: str) -> str:
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2048,
        },
    }
    req = urllib.request.Request(
        f"{GEMINI_API}?key={api_key}",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            data = json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        raise RuntimeError(f"Gemini API error {e.code}: {body}") from e
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Unexpected Gemini response: {data}") from e


def post_github_comment(token: str, repo: str, pr_number: int, body: str) -> None:
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    req = urllib.request.Request(
        url,
        data=json.dumps({"body": body}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as res:
        if res.status not in (200, 201):
            raise RuntimeError(f"GitHub API error: {res.status} {res.read()}")


def main() -> None:
    diff_path = os.environ.get("DIFF_FILE", "pr.diff")
    api_key = os.environ.get("GEMINI_API_KEY")
    github_token = os.environ.get("GITHUB_TOKEN")
    repo = os.environ.get("GITHUB_REPOSITORY")
    pr_number = os.environ.get("GITHUB_PR_NUMBER")
    extra_prompt = os.environ.get("EXTRA_PROMPT", "")

    if not api_key or not github_token or not repo or not pr_number:
        print("Missing required env: GEMINI_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_PR_NUMBER", file=sys.stderr)
        sys.exit(1)

    diff = read_diff(diff_path)
    if not diff.strip():
        post_github_comment(
            github_token,
            repo,
            int(pr_number),
            "<!-- Gemini PR Review -->\n変更されたファイルがありません。",
        )
        return

    system_instruction = """あなたはコードレビュアーです。以下の diff をレビューし、日本語で簡潔にフィードバックを書いてください。
- バグやセキュリティ、保守性の観点で指摘があれば挙げてください。
- 良い点も1〜2行で書いてください。
- 最後に「その他」で補足があれば書いてください。"""
    if extra_prompt:
        system_instruction += f"\n\n追加の指針:\n{extra_prompt}"

    chunks = chunk_text(diff, CHUNK_SIZE)
    reviews = []
    for i, chunk in enumerate(chunks):
        prompt = f"{system_instruction}\n\n## Diff (part {i+1}/{len(chunks)})\n\n```\n{chunk}\n```"
        try:
            part = call_gemini(api_key, prompt)
            reviews.append(part)
        except Exception as e:
            reviews.append(f"*(このチャンクのレビューでエラー: {e})*")

    comment_body = "## Gemini によるコードレビュー\n\n" + "\n\n---\n\n".join(reviews)
    if len(comment_body) > 65536:
        comment_body = comment_body[:65200] + "\n\n...(省略)"
    post_github_comment(github_token, repo, int(pr_number), comment_body)
    print("Posted review comment to PR.")


if __name__ == "__main__":
    main()
