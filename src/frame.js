import { createHash } from "node:crypto";

// Same organization listed under different names in the two directories.
// Each alias was resolved by hand from the directory listings (see docs/discovery.md).
export const NAME_ALIASES = {
  n1: "nation1",
  genesiscapitalequity: "genesiscapital"
};

export function normalizeName(name) {
  const key = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&#0?38;|&amp;/g, "&")
    .replace(/[–-]\s*honorary member/g, "")
    .replace(/\b(s\.r\.o\.|a\.s\.|sicav|limited)/g, "")
    .replace(/[^a-z0-9&]/g, "");
  return NAME_ALIASES[key] ?? key;
}

// Merges directory snapshots into one list of unique organizations, keeping every listing.
export function buildUnion(snapshots) {
  const byKey = new Map();
  for (const snapshot of snapshots) {
    for (const entry of snapshot.entries) {
      const key = normalizeName(entry.name);
      if (!byKey.has(key)) byKey.set(key, { key, name: entry.name, listings: [] });
      byKey.get(key).listings.push({
        source: snapshot.source,
        sourceUrl: snapshot.sourceUrl,
        name: entry.name,
        listingUrl: entry.listingUrl,
        directoryCategory: entry.directoryCategory ?? null
      });
    }
  }
  return [...byKey.values()];
}

function rank(seed, key) {
  return createHash("sha256").update(seed + ":" + key).digest("hex");
}

// Keeps the preserved organizations, then fills the frame in a seeded hash order.
// The order depends only on the seed and the normalized name, not on expected eligibility.
export function selectFrame(union, { seed, size, preserveKeys = [] }) {
  const preserved = union.filter((org) => preserveKeys.includes(org.key));
  const rest = union
    .filter((org) => !preserveKeys.includes(org.key))
    .map((org) => ({ ...org, rank: rank(seed, org.key) }))
    .sort((a, b) => a.rank.localeCompare(b.rank));
  return [...preserved, ...rest.slice(0, Math.max(0, size - preserved.length))];
}
