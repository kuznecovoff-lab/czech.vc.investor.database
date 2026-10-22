import test from "node:test";
import assert from "node:assert/strict";
import { validateDataset } from "../src/validate.js";

const validIncluded = {
  id: "sample-vc",
  name: "Sample VC",
  decision: "included",
  evidence: [{
    claim: "direct_investment",
    url: "https://example.org/news/investment",
    title: "Investment announcement",
    eventDate: "2025-04-10",
    publishedDate: "2025-04-10",
    accessDate: "2026-10-22",
    excerpt: "Sample VC invested in Example Company."
  }]
};

test("accepts an included record with dated direct-investment evidence", () => {
  assert.deepEqual(validateDataset({ datasetDate: "2026-10-22", records: [validIncluded] }), []);
});

test("rejects an included record without dated investment evidence", () => {
  const record = { ...validIncluded, evidence: [] };
  assert.ok(validateDataset({ datasetDate: "2026-10-22", records: [record] }).some((error) => error.includes("lacks dated")));
});

test("rejects duplicate IDs", () => {
  const second = { ...validIncluded, name: "Another name" };
  assert.ok(validateDataset({ datasetDate: "2026-10-22", records: [validIncluded, second] }).some((error) => error.includes("duplicates")));
});
