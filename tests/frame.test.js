import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { normalizeName, buildUnion, selectFrame } from "../src/frame.js";

// Fictional directory snapshots only.
const directoryA = {
  source: "Fictional directory A",
  sourceUrl: "https://example.org/a",
  entries: [
    { name: "Alpha Ventures", listingUrl: "https://example.org/a/alpha" },
    { name: "Beta Capital s.r.o.", listingUrl: "https://example.org/a/beta" },
    { name: "Gamma Fund", listingUrl: "https://example.org/a/gamma" },
    { name: "N1", listingUrl: "https://example.org/a/n1" }
  ]
};
const directoryB = {
  source: "Fictional directory B",
  sourceUrl: "https://example.org/b",
  entries: [
    { name: "BETA CAPITAL", listingUrl: "https://example.org/b/beta" },
    { name: "Nation1", listingUrl: "https://example.org/b/nation1" },
    { name: "Delta Partners – Honorary Member", listingUrl: "https://example.org/b/delta" }
  ]
};

test("normalizes legal suffixes, case, diacritics, and documented aliases", () => {
  assert.equal(normalizeName("Beta Capital s.r.o."), normalizeName("BETA CAPITAL"));
  assert.equal(normalizeName("Startovač"), "startovac");
  assert.equal(normalizeName("i&#038;i Biotech"), normalizeName("i&i Biotech"));
  assert.equal(normalizeName("N1"), normalizeName("Nation1"));
  assert.equal(normalizeName("Delta Partners – Honorary Member"), normalizeName("Delta Partners"));
});

test("union keeps one organization per normalized name with all listings", () => {
  const union = buildUnion([directoryA, directoryB]);
  assert.equal(union.length, 5);
  const beta = union.find((org) => org.key === normalizeName("Beta Capital"));
  assert.equal(beta.listings.length, 2);
});

test("selection keeps preserved organizations and is reproducible for a seed", () => {
  const union = buildUnion([directoryA, directoryB]);
  const options = { seed: "fictional-seed", size: 3, preserveKeys: [normalizeName("Gamma Fund")] };
  const first = selectFrame(union, options).map((org) => org.key);
  const second = selectFrame(union, options).map((org) => org.key);
  assert.deepEqual(first, second);
  assert.equal(first.length, 3);
  assert.equal(first[0], normalizeName("Gamma Fund"));
  assert.equal(new Set(first).size, 3);
});

test("the recorded project frame matches the documented selection rule", async () => {
  const read = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const candidates = await read("../data/candidates.json");
  const snapshots = await Promise.all(candidates.frame.snapshots.map((path) => read("../" + path)));
  const union = buildUnion(snapshots);
  const preserveKeys = ["Credo Ventures", "Tilia Impact Ventures", "Purple Ventures"].map(normalizeName);
  const selected = selectFrame(union, { seed: candidates.frame.seed, size: candidates.frame.size, preserveKeys });
  const recorded = candidates.candidates.map((candidate) => normalizeName(candidate.name));
  assert.deepEqual([...recorded].sort(), selected.map((org) => org.key).sort());
});
