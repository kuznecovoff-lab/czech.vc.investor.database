import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateCandidates } from "../src/validate.js";

const evidence = {
  claim: "direct_investment",
  sourceTitle: "Example Company raises a seed round",
  publisher: "Example Company (investment recipient)",
  url: "https://example.org/news/seed",
  eventDate: "2025-04-10",
  publishedDate: null,
  accessDate: "2026-10-22",
  excerpt: "Example Company names Sample VC as an investor."
};

const candidate = {
  id: "candidate-sample-vc",
  name: "Sample VC",
  status: "candidate",
  decision: "pending_manual_review",
  discoverySources: [{ source: "Fictional directory", sourceUrl: "https://example.org/directory", listingUrl: "https://example.org/directory/sample-vc" }],
  evidence: [evidence]
};

function check(candidates) {
  return validateCandidates({ discoveryDate: "2026-10-22", candidates });
}

test("accepts a candidate with complete source fields and a null publication date", () => {
  assert.deepEqual(check([candidate]), []);
});

test("rejects final-schema decisions on candidates", () => {
  const errors = check([{ ...candidate, decision: "included" }]);
  assert.ok(errors.some((error) => error.includes(".decision must be one of")));
});

test("rejects candidate evidence missing required source fields", () => {
  for (const field of ["claim", "sourceTitle", "publisher", "url", "accessDate", "excerpt"]) {
    const { [field]: _removed, ...partial } = evidence;
    const errors = check([{ ...candidate, evidence: [partial] }]);
    assert.ok(errors.some((error) => error.includes("." + field)), field + " should be required");
  }
});

test("rejects non-HTTPS candidate source URLs", () => {
  const errors = check([{ ...candidate, evidence: [{ ...evidence, url: "http://example.org" }] }]);
  assert.ok(errors.some((error) => error.includes(".url must be an HTTPS URL")));
});

test("rejects incomplete manual verification notes", () => {
  const errors = check([{ ...candidate, evidence: [{ ...evidence, manualVerification: { reviewer: "user" } }] }]);
  assert.ok(errors.some((error) => error.includes("manualVerification")));
});

test("requires discovery sources with HTTPS URLs", () => {
  const { discoverySources: _removed, ...withoutSources } = candidate;
  assert.ok(check([withoutSources]).some((error) => error.includes("discoverySources must be")));
  const httpSource = [{ source: "Fictional directory", sourceUrl: "http://example.org", listingUrl: "https://example.org/x" }];
  assert.ok(check([{ ...candidate, discoverySources: httpSource }]).some((error) => error.includes("discoverySources[0]")));
});

test("rejects duplicate candidate IDs", () => {
  assert.ok(check([candidate, { ...candidate }]).some((error) => error.includes("duplicates")));
});

test("the project candidate file passes candidate validation", async () => {
  const data = JSON.parse(await readFile(new URL("../data/candidates.json", import.meta.url), "utf8"));
  assert.deepEqual(validateCandidates(data), []);
});
