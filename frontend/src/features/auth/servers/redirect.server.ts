import "server-only";

import type { Session } from "better-auth";
import { redirect } from "next/navigation";

import type { Account } from "@/features/account/types";
import { getSessionServer } from "@/features/auth/servers/auth.server";

/** 認証済みセッションの型（accountが必須） */
export type AuthenticatedSession = Omit<Session, "account"> & {
  account: Account;
};

export const requireAuthServer = async () => {
  const session = await getSessionServer();
  if (!session?.account || session.error) {
    redirect("/login");
  }
};

export const getAuthenticatedSessionServer =
  async (): Promise<AuthenticatedSession> => {
    const session = await getSessionServer();
    if (!session?.account || session.error) {
      redirect("/login");
    }
    // redirect()はneverを返すので、ここに到達した時点でaccountは必ず存在
    return session as AuthenticatedSession;
  };

export const redirectIfAuthenticatedServer = async () => {
  const session = await getSessionServer();
  if (session?.account && !session.error) {
    redirect("/notes");
  }
};