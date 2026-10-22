import test from "node:test";
import assert from "node:assert/strict";
import { validateDataset, activeWindowStart } from "../src/validate.js";

const investment = {
  claim: "direct_investment",
  url: "https://example.org/news/investment",
  title: "Investment announcement",
  publisher: "Example Company (investment recipient)",
  eventDate: "2025-04-10",
  publishedDate: "2025-04-10",
  accessDate: "2026-10-22",
  excerpt: "Sample VC invested in Example Company."
};

const office = {
  claim: "operating_office",
  url: "https://example.org/contact",
  title: "Contact",
  publisher: "Sample VC",
  eventDate: null,
  publishedDate: null,
  accessDate: "2026-10-22",
  excerpt: "Our team works from Prague."
};

const validIncluded = {
  id: "sample-vc",
  name: "Sample VC",
  decision: "included",
  activityStatus: "active",
  operatingOffice: { city: "Prague", country: "Czech Republic" },
  evidence: [investment, office]
};

function check(record, datasetDate = "2026-10-22") {
  return validateDataset({ datasetDate, records: [record] });
}

test("accepts an included record with dated investment and operating-office evidence", () => {
  assert.deepEqual(check(validIncluded), []);
});

test("rejects an included record without dated investment evidence", () => {
  const record = { ...validIncluded, activityStatus: null, evidence: [office] };
  assert.ok(check(record).some((error) => error.includes("lacks dated")));
});

test("rejects investment evidence without an event date", () => {
  const record = { ...validIncluded, activityStatus: null, evidence: [{ ...investment, eventDate: null }, office] };
  assert.ok(check(record).some((error) => error.includes("lacks dated")));
});

test("rejects evidence without a publisher", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, publisher: " " }, office] };
  const errors = check(record);
  assert.ok(errors.some((error) => error.includes(".publisher is required")));
  assert.ok(errors.some((error) => error.includes("lacks dated")));
});

test("rejects an included record without operating-office evidence", () => {
  const record = { ...validIncluded, evidence: [investment] };
  assert.ok(check(record).some((error) => error.includes("lacks operating_office evidence")));
});

test("a registered office does not satisfy the operating-office requirement", () => {
  const registered = { ...office, claim: "registered_office", excerpt: "Registered office: Brno." };
  const record = { ...validIncluded, registeredOffice: { city: "Brno", country: "Czech Republic" }, evidence: [investment, registered] };
  assert.ok(check(record).some((error) => error.includes("lacks operating_office evidence")));
});

test("rejects an included record whose operating office is outside the Czech Republic", () => {
  const record = { ...validIncluded, operatingOffice: { city: "Vienna", country: "Austria" } };
  assert.ok(check(record).some((error) => error.includes("operatingOffice.country")));
});

test("needs_review records do not require complete evidence", () => {
  const record = { id: "x", name: "Borderline VC", decision: "needs_review", evidence: [] };
  assert.deepEqual(check(record), []);
});

test("rejects duplicate IDs", () => {
  const second = { ...validIncluded, name: "Another name" };
  const errors = validateDataset({ datasetDate: "2026-10-22", records: [validIncluded, second] });
  assert.ok(errors.some((error) => error.includes("duplicates")));
});

test("rejects impossible calendar dates", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, publishedDate: "2025-02-31" }, office] };
  assert.ok(check(record).some((error) => error.includes("publishedDate")));
});

test("active window is calculated from datasetDate", () => {
  assert.equal(activeWindowStart("2026-10-22"), "2023-10-22");
  assert.equal(activeWindowStart("2027-02-28"), "2024-02-28");
  assert.equal(activeWindowStart("2028-02-29"), "2025-02-28");
});

test("active label accepts an investment on the first day of the window", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, eventDate: "2023-10-22" }, office] };
  assert.deepEqual(check(record), []);
});

test("active label rejects an investment older than 36 months before datasetDate", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, eventDate: "2023-10-21" }, office] };
  assert.ok(check(record).some((error) => error.includes("labelled active")));
});

test("the same record passes or fails the active check depending only on datasetDate", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, eventDate: "2022-06-01" }, office] };
  assert.deepEqual(check(record, "2025-01-01"), []);
  assert.ok(check(record, "2026-10-22").some((error) => error.includes("labelled active")));
});

test("an old investment is allowed when the record is labelled historical", () => {
  const record = { ...validIncluded, activityStatus: "historical", evidence: [{ ...investment, eventDate: "2020-01-15" }, office] };
  assert.deepEqual(check(record), []);
});

test("rejects an investment event dated after datasetDate", () => {
  const record = { ...validIncluded, evidence: [{ ...investment, eventDate: "2026-11-01" }, office] };
  const errors = check(record);
  assert.ok(errors.some((error) => error.includes("after datasetDate")));
  assert.ok(errors.some((error) => error.includes("lacks dated")));
});

test("rejects an unknown activityStatus", () => {
  const record = { ...validIncluded, activityStatus: "dormant" };
  assert.ok(check(record).some((error) => error.includes("activityStatus")));
});
