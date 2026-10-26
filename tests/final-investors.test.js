import test from "node:test";
import assert from "node:assert/strict";
import { validateFinalInvestors } from "../src/validate.js";

// Fictional records and labels only.
const labels = new Map([["candidate-a", "eligible"], ["candidate-b", "not_eligible"]]);

const source = (id, claim) => ({
  id,
  claim,
  url: "https://example.org/" + id,
  title: "Example page",
  publisher: "Sample VC (official website)",
  sourceType: "official_investor",
  publishedDate: null,
  eventDate: null,
  accessDate: "2026-10-22",
  excerpt: "Fictional excerpt.",
  userChecked: false
});

const record = {
  id: "investor-a",
  candidateId: "candidate-a",
  name: "Sample VC",
  humanLabel: "eligible",
  activityStatus: "active",
  investorType: { value: "Venture capital manager", sources: ["type"] },
  operatingOffice: { value: { city: "Prague", country: "Czech Republic" }, sources: ["office"] },
  registeredOffice: { value: null, unavailableReason: "Not checked." },
  sectorFocus: { value: "Software", sources: ["type"] },
  stage: { value: "Seed", sources: ["type"] },
  ticket: { value: null, unavailableReason: "Not disclosed." },
  aum: { value: null, unavailableReason: "Not disclosed." },
  capital: [{ metricType: "fund target", value: { amount: 1, currency: "EUR" }, sources: ["type"] }],
  investments: [{
    company: "Example Co",
    eventDate: "2025-04-10",
    roundTotal: { amount: 2000000, currency: "EUR" },
    investorAmount: null,
    investorAmountReason: "Not disclosed.",
    sources: ["deal"]
  }],
  sourceItems: [source("type", "investor_type"), source("office", "operating_office"), source("deal", "direct_investment")]
};

function check(records, datasetDate = "2026-10-22") {
  return validateFinalInvestors({ datasetDate, records }, labels);
}

test("accepts a sourced record for an eligible candidate", () => {
  assert.deepEqual(check([record]), []);
});

test("rejects records for candidates without an eligible human label", () => {
  assert.ok(check([record, { ...record, id: "investor-b", candidateId: "candidate-b" }])
    .some((error) => error.includes("no eligible human label")));
});

test("requires a final record for every eligible candidate", () => {
  assert.ok(check([]).some((error) => error.includes("candidate-a has no final investor record")));
});

test("rejects a fact with a value but no sources, or with an unknown source", () => {
  assert.ok(check([{ ...record, sectorFocus: { value: "Software" } }]).some((error) => error.includes("sectorFocus has a value but no sources")));
  assert.ok(check([{ ...record, stage: { value: "Seed", sources: ["missing"] } }]).some((error) => error.includes("unknown source item missing")));
});

test("requires a reason when a fact is unavailable", () => {
  assert.ok(check([{ ...record, ticket: { value: null } }]).some((error) => error.includes("ticket has no value")));
});

test("requires a reason when the investor's own cheque is unknown", () => {
  const investment = { ...record.investments[0], investorAmountReason: undefined };
  assert.ok(check([{ ...record, investments: [investment] }]).some((error) => error.includes("investorAmountReason")));
});

test("requires a Czech operating office", () => {
  assert.ok(check([{ ...record, operatingOffice: { value: { city: "Warsaw", country: "Poland" }, sources: ["office"] } }])
    .some((error) => error.includes("operatingOffice")));
});

test("active status depends on an investment inside the window before datasetDate", () => {
  const old = { ...record.investments[0], eventDate: "2023-10-21" };
  assert.ok(check([{ ...record, investments: [old] }]).some((error) => error.includes("labelled active")));
  const edge = { ...record.investments[0], eventDate: "2023-10-22" };
  assert.deepEqual(check([{ ...record, investments: [edge] }]), []);
});

test("accepts an undated investment only with a year-month period", () => {
  const dated = record.investments[0];
  const undated = { ...dated, eventDate: null };
  assert.ok(check([{ ...record, investments: [dated, undated] }]).some((error) => error.includes("eventPeriod")));
  assert.deepEqual(check([{ ...record, investments: [dated, { ...undated, eventPeriod: "2026-05" }] }]), []);
});
