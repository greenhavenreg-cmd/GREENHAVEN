-- RECOVERED SOURCE — RUN384 / 2026-11-24
-- The connected Testnet migration history records version 20261122133100, but
-- this source file was absent from the supplied archive. The live catalog contains
-- the matching conversation-leading btree index below. The exact original SQL
-- could not be retrieved, so this is a catalog-derived reconstruction, not a
-- byte-identical original. The connected Testnet already records this version;
-- DO NOT replay it there.
BEGIN;
CREATE INDEX IF NOT EXISTS idx_gh_call_sessions_conversation_created
  ON public.gh_call_sessions USING btree (conversation_id, created_at DESC);
COMMIT;
