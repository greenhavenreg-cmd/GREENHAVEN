/**
 * Convert a data: or blob: URL to a Blob WITHOUT depending on the page's
 * Content-Security-Policy `connect-src`.
 *
 * `fetch("data:...")` / `fetch("blob:...")` are governed by connect-src. When the
 * policy does not list those schemes the browser rejects the request with
 * "TypeError: Failed to fetch", which made every compressed image upload fail
 * before it ever reached the network. data: URLs are decoded locally here;
 * blob: URLs (same-origin object URLs) fall back to fetch, which the CSP now permits.
 */
export async function urlToBlob(url: string): Promise<Blob> {
  const value = String(url || "")
  if (!value.startsWith("data:")) {
    const response = await fetch(value)
    if (!response.ok) throw new Error("MEDIA_SOURCE_UNREADABLE")
    return response.blob()
  }
  const comma = value.indexOf(",")
  if (comma < 0) throw new Error("MEDIA_DATA_URL_INVALID")
  const header = value.slice(5, comma)
  const payload = value.slice(comma + 1)
  const parts = header.split(";")
  const isBase64 = parts.some((p) => p.toLowerCase() === "base64")
  const mime = (parts[0] && parts[0].includes("/") ? parts[0] : "text/plain").toLowerCase()
  if (!isBase64) return new Blob([decodeURIComponent(payload)], { type: mime })
  const binary = atob(payload.replace(/\s+/g, ""))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}
