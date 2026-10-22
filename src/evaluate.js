import { createHash } from "node:crypto";

export const PREDICTIONS = new Set(["included", "excluded", "needs_review"]);
export const LABELS = new Set(["eligible", "not_eligible", "unresolved"]);

const SAMPLE_RECALL_SCOPE = "Sample recall: measured only against the frozen candidate list, not against all investors in the market.";

// Fingerprint of parsed JSON, so Git line-ending conversion does not change it.
export function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function metric(numerator, denominator, unavailableReason) {
  if (!denominator) return { status: "unavailable", value: null, numerator, denominator, reason: unavailableReason };
  return { status: "available", value: numerator / denominator, numerator, denominator };
}

function freezeCheck(expected, actual) {
  if (expected == null) return "not_frozen";
  return expected === actual ? "matches" : "changed_since_freeze";
}

// Joins the frozen candidate list, preliminary predictions, and human labels.
// Human labels are only read here; this module never creates them.
export function evaluate({ candidates, records, reviews, freeze = {} }) {
  const issues = [];
  const frameIds = new Set(candidates.map((candidate) => candidate.id));

  const predictionByCandidate = new Map();
  for (const record of records) {
    const label = "Prediction " + (record.id ?? "(no id)");
    if (typeof record.candidateId !== "string") issues.push(label + " has no candidateId.");
    else if (!frameIds.has(record.candidateId)) issues.push(label + " refers to " + record.candidateId + ", which is not in the frozen candidate list.");
    else if (predictionByCandidate.has(record.candidateId)) issues.push(label + " duplicates the prediction for " + record.candidateId + ".");
    else if (!PREDICTIONS.has(record.decision)) issues.push(label + " has an invalid decision.");
    else predictionByCandidate.set(record.candidateId, record.decision);
  }

  const labelByCandidate = new Map();
  for (const review of reviews) {
    const label = "Review for " + (review.candidateId ?? "(no candidateId)");
    if (!frameIds.has(review.candidateId)) issues.push(label + " is not in the frozen candidate list.");
    else if (labelByCandidate.has(review.candidateId)) issues.push(label + " is duplicated.");
    else if (!LABELS.has(review.label)) issues.push(label + " has an invalid label.");
    else labelByCandidate.set(review.candidateId, review.label);
  }

  const binary = { tp: [], fp: [], tn: [], fn: [] };
  const separate = {
    withoutPrediction: [],
    unreviewedIncluded: [],
    unreviewedExcluded: [],
    unresolvedIncluded: [],
    unresolvedExcluded: [],
    needsReview: { eligible: [], not_eligible: [], unresolved: [], unreviewed: [] }
  };

  for (const { id } of candidates) {
    const prediction = predictionByCandidate.get(id);
    const label = labelByCandidate.get(id);
    if (!prediction) {
      separate.withoutPrediction.push(id);
    } else if (prediction === "needs_review") {
      separate.needsReview[label ?? "unreviewed"].push(id);
    } else if (!label) {
      (prediction === "included" ? separate.unreviewedIncluded : separate.unreviewedExcluded).push(id);
    } else if (label === "unresolved") {
      (prediction === "included" ? separate.unresolvedIncluded : separate.unresolvedExcluded).push(id);
    } else if (prediction === "included") {
      (label === "eligible" ? binary.tp : binary.fp).push(id);
    } else {
      (label === "eligible" ? binary.fn : binary.tn).push(id);
    }
  }

  const tp = binary.tp.length;
  const fp = binary.fp.length;
  const fn = binary.fn.length;
  const unresolvedIncluded = separate.unresolvedIncluded.length;

  const freezeStatus = {
    candidates: freezeCheck(freeze.candidatesFingerprint, fingerprint(candidates)),
    predictions: freezeCheck(freeze.predictionsFingerprint, fingerprint(records))
  };
  for (const [name, status] of Object.entries(freezeStatus)) {
    if (status === "changed_since_freeze") issues.push("The " + name + " changed after the recorded freeze; metrics do not describe the frozen version.");
  }

  return {
    frame: {
      candidateCount: candidates.length,
      predictionCount: predictionByCandidate.size,
      humanLabelCount: labelByCandidate.size,
      freezeStatus
    },
    counts: { tp, fp, tn: binary.tn.length, fn },
    ids: binary,
    separate,
    metrics: {
      precision: metric(tp, tp + fp,
        "No included prediction has a binary human label (eligible or not_eligible)."),
      conservativePrecision: {
        ...metric(tp, tp + fp + unresolvedIncluded,
          "No included prediction has a human label."),
        note: "Counts unresolved included predictions as failures."
      },
      sampleRecall: {
        ...metric(tp, tp + fn,
          "No included or excluded prediction has a human label of eligible."),
        note: SAMPLE_RECALL_SCOPE
      }
    },
    issues
  };
}
