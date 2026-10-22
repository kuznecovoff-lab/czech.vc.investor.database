import test from "node:test";
import assert from "node:assert/strict";
import { evaluateIncluded } from "../src/evaluate.js";

test("calculates precision and conservative estimate from manual labels", () => {
  const records = [
    { id: "a", decision: "included" },
    { id: "b", decision: "included" },
    { id: "c", decision: "included" }
  ];
  const reviews = [
    { id: "a", label: "confirmed" },
    { id: "b", label: "rejected" },
    { id: "c", label: "unresolved" }
  ];
  const result = evaluateIncluded(records, reviews);
  assert.equal(result.tp, 1);
  assert.equal(result.fp, 1);
  assert.equal(result.unresolved, 1);
  assert.equal(result.precision, 0.5);
  assert.equal(result.conservativeLowerEstimate, 1 / 3);
});

test("reports missing manual reviews", () => {
  const result = evaluateIncluded([{ id: "a", decision: "included" }], []);
  assert.deepEqual(result.missingReview, ["a"]);
  assert.equal(result.precision, null);
});
