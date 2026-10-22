import { readFile } from "node:fs/promises";
import { validateDataset } from "./validate.js";
import { evaluateIncluded } from "./evaluate.js";

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

const command = process.argv[2];
const dataset = await readJson("../data/investors.json");

if (command === "validate") {
  const errors = validateDataset(dataset);
  if (errors.length) {
    console.error("Validation failed (" + errors.length + " issue(s)):");
    for (const error of errors) console.error("- " + error);
    process.exitCode = 1;
  } else {
    console.log("Dataset valid: " + dataset.records.length + " record(s).");
  }
} else if (command === "evaluate") {
  const reviewData = await readJson("../data/reviews.json");
  const result = evaluateIncluded(dataset.records, reviewData.reviews);
  console.log(JSON.stringify(result, null, 2));
  if (result.missingReview.length || result.invalidReview.length) process.exitCode = 1;
} else {
  console.error("Usage: node src/cli.js <validate|evaluate>");
  process.exitCode = 2;
}
