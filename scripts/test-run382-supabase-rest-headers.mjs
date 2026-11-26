#!/usr/bin/env node
import assert from "node:assert/strict"
import { serviceHeaders } from "../lib/server/supabase/rest-headers.ts"

const json = serviceHeaders("server-key", undefined, JSON.stringify({ pi_app_uid: "verified" }))
assert.equal(json.get("Content-Type"), "application/json")
assert.equal(json.get("Accept"), "application/json")
assert.equal(json.get("apikey"), "server-key")
assert.equal(json.get("Authorization"), "Bearer server-key")

const explicit = serviceHeaders("server-key", { "Content-Type": "application/vnd.custom+json" }, JSON.stringify({ ok: true }))
assert.equal(explicit.get("Content-Type"), "application/vnd.custom+json")

const nonJson = serviceHeaders("server-key", undefined, "plain text")
assert.equal(nonJson.has("Content-Type"), false)

const formData = new FormData()
formData.set("field", "value")
const multipart = serviceHeaders("server-key", undefined, formData)
assert.equal(multipart.has("Content-Type"), false)

const empty = serviceHeaders("server-key", undefined, null)
assert.equal(empty.has("Content-Type"), false)

console.log("RUN382 Supabase REST header behavior: 5 cases passed")
