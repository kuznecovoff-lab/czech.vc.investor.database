import test from "node:test";
import assert from "node:assert/strict";
import { validateReviews } from "../src/validate.js";

// Fictional review labels only.
const candidateIds = new Set(["candidate-a", "candidate-b"]);

const review = {
  candidateId: "candidate-a",
  label: "eligible",
  reviewer: "test-reviewer",
  reviewDate: "2026-10-22",
  reason: "Fictional reason.",
  sourceUrls: ["https://example.org/a"]
};

function check(reviews, extra = {}) {
  return validateReviews({ datasetDate: "2026-10-22", reviews, ...extra }, candidateIds);
}

test("accepts a complete human review label", () => {
  assert.deepEqual(check([review]), []);
});

test("accepts an empty review file", () => {
  assert.deepEqual(check([], { freeze: { frozenOn: null, candidatesFingerprint: null, predictionsFingerprint: null } }), []);
});

test("rejects prediction vocabulary as a human label", () => {
  assert.ok(check([{ ...review, label: "included" }]).some((error) => error.includes(".label")));
});

test("requires reviewer, review date, reason, and source URLs", () => {
  for (const field of ["reviewer", "reviewDate", "reason", "sourceUrls"]) {
    const { [field]: _removed, ...partial } = review;
    assert.ok(check([partial]).some((error) => error.includes("." + field)), field + " should be required");
  }
});

test("rejects empty or non-HTTPS source URLs", () => {
  assert.ok(check([{ ...review, sourceUrls: [] }]).some((error) => error.includes("sourceUrls")));
  assert.ok(check([{ ...review, sourceUrls: ["http://example.org"] }]).some((error) => error.includes("sourceUrls")));
});

test("rejects labels for candidates outside the frozen list and duplicate labels", () => {
  assert.ok(check([{ ...review, candidateId: "candidate-z" }]).some((error) => error.includes("not in the frozen candidate list")));
  assert.ok(check([review, { ...review }]).some((error) => error.includes("duplicates")));
});

test("rejects malformed freeze fingerprints", () => {
  assert.ok(check([], { freeze: { candidatesFingerprint: "abc" } }).some((error) => error.includes("candidatesFingerprint")));
});
