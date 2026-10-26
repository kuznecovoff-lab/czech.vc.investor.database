import { readFile } from "node:fs/promises";
import { validateDataset, validateCandidates, validateReviews, validateFinalInvestors } from "./validate.js";
import { evaluate, fingerprint } from "./evaluate.js";

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

function report(label, errors, count) {
  if (errors.length) {
    console.error(label + " validation failed (" + errors.length + " issue(s)):");
    for (const error of errors) console.error("- " + error);
    process.exitCode = 1;
  } else {
    console.log(label + " valid: " + count + " record(s).");
  }
}

const command = process.argv[2];
const candidateData = await readJson("../data/candidates.json");
const dataset = await readJson("../data/investors.json");
const reviewData = await readJson("../data/reviews.json");
const finalData = await readJson("../data/final-investors.json");
const candidateIds = new Set((candidateData.candidates ?? []).map((candidate) => candidate.id));
const labelByCandidate = new Map((reviewData.reviews ?? []).map((review) => [review.candidateId, review.label]));

if (command === "validate") {
  report("Candidates (data/candidates.json)", validateCandidates(candidateData), candidateData.candidates?.length ?? 0);
  report("Investors (data/investors.json)", validateDataset(dataset), dataset.records?.length ?? 0);
  report("Human reviews (data/reviews.json)", validateReviews(reviewData, candidateIds), reviewData.reviews?.length ?? 0);
  report("Final investors (data/final-investors.json)", validateFinalInvestors(finalData, labelByCandidate), finalData.records?.length ?? 0);
} else if (command === "evaluate") {
  const reviewErrors = validateReviews(reviewData, candidateIds);
  if (reviewErrors.length) {
    report("Human reviews (data/reviews.json)", reviewErrors, 0);
  } else {
    const result = evaluate({
      candidates: candidateData.candidates,
      records: dataset.records,
      reviews: reviewData.reviews,
      freeze: reviewData.freeze ?? {}
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.issues.length) process.exitCode = 1;
  }
} else if (command === "fingerprint") {
  // Prints values for a person to copy into data/reviews.json "freeze"; writes nothing.
  console.log(JSON.stringify({
    candidatesFingerprint: fingerprint(candidateData.candidates),
    predictionsFingerprint: fingerprint(dataset.records)
  }, null, 2));
} else {
  console.error("Usage: node src/cli.js <validate|evaluate|fingerprint>");
  process.exitCode = 2;
}
