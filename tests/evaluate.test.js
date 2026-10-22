import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, fingerprint } from "../src/evaluate.js";

// Fictional candidates, predictions, and labels only.
const candidates = ["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => ({ id, name: "Fictional " + id }));

function prediction(candidateId, decision) {
  return { id: "rec-" + candidateId, candidateId, name: "Fictional " + candidateId, decision, evidence: [] };
}

function label(candidateId, value) {
  return { candidateId, label: value, reviewer: "test-reviewer", reviewDate: "2026-10-22", reason: "Fictional test label.", sourceUrls: ["https://example.org/" + candidateId] };
}

const records = [
  prediction("a", "included"),
  prediction("b", "included"),
  prediction("c", "included"),
  prediction("d", "excluded"),
  prediction("e", "excluded"),
  prediction("f", "needs_review"),
  prediction("g", "included")
];

const reviews = [
  label("a", "eligible"),
  label("b", "not_eligible"),
  label("c", "unresolved"),
  label("d", "not_eligible"),
  label("e", "eligible"),
  label("f", "eligible")
];

test("counts TP, FP, TN, FN only for binary-labelled included/excluded predictions", () => {
  const result = evaluate({ candidates, records, reviews });
  assert.deepEqual(result.counts, { tp: 1, fp: 1, tn: 1, fn: 1 });
  assert.deepEqual(result.ids, { tp: ["a"], fp: ["b"], tn: ["d"], fn: ["e"] });
  assert.deepEqual(result.issues, []);
});

test("keeps needs_review, unresolved, unreviewed, and unpredicted cases out of binary counts", () => {
  const { separate } = evaluate({ candidates, records, reviews });
  assert.deepEqual(separate.unresolvedIncluded, ["c"]);
  assert.deepEqual(separate.unreviewedIncluded, ["g"]);
  assert.deepEqual(separate.needsReview.eligible, ["f"]);
  assert.deepEqual(separate.withoutPrediction, ["h"]);
});

test("calculates precision, conservative precision, and sample recall", () => {
  const { metrics } = evaluate({ candidates, records, reviews });
  assert.equal(metrics.precision.value, 0.5);
  assert.equal(metrics.precision.denominator, 2);
  assert.equal(metrics.conservativePrecision.value, 1 / 3);
  assert.equal(metrics.conservativePrecision.denominator, 3);
  assert.equal(metrics.sampleRecall.value, 0.5);
  assert.match(metrics.sampleRecall.note, /frozen candidate list/);
});

test("reports metrics as unavailable, not 0, when there are no human reviews", () => {
  const { metrics, frame } = evaluate({ candidates, records, reviews: [] });
  assert.equal(frame.humanLabelCount, 0);
  for (const name of ["precision", "conservativePrecision", "sampleRecall"]) {
    assert.equal(metrics[name].status, "unavailable");
    assert.equal(metrics[name].value, null);
  }
});

test("reports metrics as unavailable when there are no predictions", () => {
  const { metrics, separate } = evaluate({ candidates, records: [], reviews: [label("a", "eligible")] });
  assert.equal(metrics.precision.status, "unavailable");
  assert.equal(metrics.sampleRecall.status, "unavailable");
  assert.equal(separate.withoutPrediction.length, candidates.length);
});

test("an all-false-positive result is 0, not unavailable", () => {
  const { metrics } = evaluate({ candidates, records: [prediction("a", "included")], reviews: [label("a", "not_eligible")] });
  assert.equal(metrics.precision.status, "available");
  assert.equal(metrics.precision.value, 0);
  assert.equal(metrics.sampleRecall.status, "unavailable");
});

test("only unresolved included predictions give unavailable precision but 0 conservative precision", () => {
  const { metrics } = evaluate({ candidates, records: [prediction("a", "included")], reviews: [label("a", "unresolved")] });
  assert.equal(metrics.precision.status, "unavailable");
  assert.equal(metrics.conservativePrecision.value, 0);
});

test("needs_review predictions labelled eligible do not count as false negatives", () => {
  const { counts, metrics } = evaluate({ candidates, records: [prediction("f", "needs_review")], reviews: [label("f", "eligible")] });
  assert.equal(counts.fn, 0);
  assert.equal(metrics.sampleRecall.status, "unavailable");
});

test("reports predictions and reviews that cannot be joined to the candidate list", () => {
  const { issues } = evaluate({
    candidates,
    records: [{ id: "x", decision: "included" }, prediction("zz", "included"), prediction("a", "included"), prediction("a", "excluded")],
    reviews: [label("zz", "eligible"), label("b", "maybe")]
  });
  assert.ok(issues.some((issue) => issue.includes("has no candidateId")));
  assert.ok(issues.some((issue) => issue.includes("rec-zz refers to zz")));
  assert.ok(issues.some((issue) => issue.includes("duplicates the prediction")));
  assert.ok(issues.some((issue) => issue.includes("Review for zz")));
  assert.ok(issues.some((issue) => issue.includes("invalid label")));
});

test("freeze check detects predictions changed after the recorded freeze", () => {
  const freeze = { candidatesFingerprint: fingerprint(candidates), predictionsFingerprint: fingerprint(records) };
  assert.deepEqual(evaluate({ candidates, records, reviews, freeze }).frame.freezeStatus, { candidates: "matches", predictions: "matches" });
  const changed = evaluate({ candidates, records: records.slice(1), reviews, freeze });
  assert.equal(changed.frame.freezeStatus.predictions, "changed_since_freeze");
  assert.ok(changed.issues.some((issue) => issue.includes("changed after the recorded freeze")));
});

test("does not create or modify human labels", () => {
  const input = reviews.map((review) => ({ ...review }));
  evaluate({ candidates, records, reviews: input });
  assert.deepEqual(input, reviews);
  assert.equal(evaluate({ candidates, records, reviews: [] }).frame.humanLabelCount, 0);
});
