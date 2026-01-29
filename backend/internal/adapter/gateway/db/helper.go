package db

import (
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// UUIDFromPgtype pgtype.UUIDをstringに変換
func UUIDFromPgtype(pgUUID pgtype.UUID) string {
	if !pgUUID.Valid {
		return ""
	}
	// pgtype.UUIDのBytesフィールドからuuid.UUIDに変換
	var uuidBytes [16]byte
	copy(uuidBytes[:], pgUUID.Bytes[:])
	uuidValue := uuid.UUID(uuidBytes)
	return uuidValue.String()
}
