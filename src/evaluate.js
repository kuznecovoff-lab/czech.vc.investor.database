const LABELS = new Set(["confirmed", "rejected", "unresolved"]);

export function evaluateIncluded(records, reviews) {
  const included = records.filter((record) => record.decision === "included");
  const reviewById = new Map(reviews.map((review) => [review.id, review]));
  let tp = 0;
  let fp = 0;
  let unresolved = 0;
  const missingReview = [];
  const invalidReview = [];

  for (const record of included) {
    const review = reviewById.get(record.id);
    if (!review) {
      missingReview.push(record.id);
      continue;
    }
    if (!LABELS.has(review.label)) {
      invalidReview.push(record.id);
      continue;
    }
    if (review.label === "confirmed") tp += 1;
    if (review.label === "rejected") fp += 1;
    if (review.label === "unresolved") unresolved += 1;
  }

  const reviewed = tp + fp + unresolved;
  const precisionDenominator = tp + fp;
  return {
    includedCount: included.length,
    reviewedCount: reviewed,
    tp,
    fp,
    unresolved,
    missingReview,
    invalidReview,
    precision: precisionDenominator ? tp / precisionDenominator : null,
    conservativeLowerEstimate: reviewed ? tp / (tp + fp + unresolved) : null
  };
}
