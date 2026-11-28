import assert from "node:assert/strict"
import { dateBucketOf, DATE_BUCKET_LABEL } from "../lib/ui/date-buckets.ts"

// Fixed "now": 2026-11-28 15:30 local time.
const now = new Date(2026, 10, 28, 15, 30, 0).getTime()
const at = (y, m, d, h = 12) => new Date(y, m, d, h, 0, 0).getTime()

assert.equal(dateBucketOf(at(2026, 10, 28, 0), now), "today")
assert.equal(dateBucketOf(now + 60_000, now), "today", "future timestamps (clock skew) stay in Today")
assert.equal(dateBucketOf(at(2026, 10, 27, 23), now), "yesterday")
assert.equal(dateBucketOf(at(2026, 10, 27, 0), now), "yesterday")
assert.equal(dateBucketOf(at(2026, 10, 26, 23), now), "thisWeek")
assert.equal(dateBucketOf(at(2026, 10, 22, 12), now), "thisWeek")
assert.equal(dateBucketOf(at(2026, 10, 21, 12), now), "earlier")
assert.equal(dateBucketOf(0, now), "earlier")
assert.equal(dateBucketOf(Number.NaN, now), "earlier")
for (const key of ["today", "yesterday", "thisWeek", "earlier"]) assert.ok(DATE_BUCKET_LABEL[key], `label for ${key}`)
console.log("RUN467 date-bucket contract passed")
