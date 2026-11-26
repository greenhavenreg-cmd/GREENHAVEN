/**
 * Shared operator API keys authenticate a service boundary, not an individual.
 * Audit records must not accept a claimed human actor from request JSON.
 * Use this explicit service principal until operator identity is session-bound.
 */
export const OPERATOR_KEY_AUDIT_ACTOR = "service:operator-key" as const
