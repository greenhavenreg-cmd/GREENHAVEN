/** Shared server-side headers for privileged Supabase REST requests. */

function isJsonStringBody(body: BodyInit | null | undefined): body is string {
  if (typeof body !== "string") return false
  try {
    JSON.parse(body)
    return true
  } catch {
    return false
  }
}

export function serviceHeaders(key: string, extra?: HeadersInit, body?: BodyInit | null): Headers {
  const headers = new Headers(extra)
  headers.set("apikey", key)
  headers.set("Authorization", `Bearer ${key}`)
  if (!headers.has("Accept")) headers.set("Accept", "application/json")

  // fetch treats an untyped string body as text/plain. PostgREST JSON writes need
  // application/json. Preserve explicit caller types and leave FormData, Blob,
  // URLSearchParams, and streams to their native fetch content-type handling.
  if (!headers.has("Content-Type") && isJsonStringBody(body)) {
    headers.set("Content-Type", "application/json")
  }

  return headers
}
