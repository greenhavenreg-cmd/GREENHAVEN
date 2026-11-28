/** Release identity; session integrity and release gates are versioned with this source. */
export const APP_RELEASE_VERSION = "0.338.177"

/** Concise, privacy-safe release note shown in the authenticated in-app update notice. */
export const APP_RELEASE_SUMMARY =
  "Improves direct-call control isolation and accessibility: microphone/camera state resets for each call, toggle states are exposed to assistive technology, and call-phase changes are announced. Existing messaging outage protections remain."
