const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DECISIONS = new Set(["included", "excluded", "needs_review"]);

function isDate(value) {
  return typeof value === "string" && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00Z"));
}

export function validateDataset(dataset) {
  const errors = [];
  if (!dataset || typeof dataset !== "object" || !Array.isArray(dataset.records)) {
    return ["Dataset must be an object with a records array."];
  }
  if (!isDate(dataset.datasetDate)) errors.push("datasetDate must use YYYY-MM-DD.");

  const ids = new Set();
  for (const [index, record] of dataset.records.entries()) {
    const where = "records[" + index + "]";
    if (!record || typeof record !== "object") {
      errors.push(where + " must be an object.");
      continue;
    }
    if (typeof record.id !== "string" || !record.id.trim()) errors.push(where + ".id is required.");
    else if (ids.has(record.id)) errors.push(where + ".id duplicates " + record.id + ".");
    else ids.add(record.id);
    if (typeof record.name !== "string" || !record.name.trim()) errors.push(where + ".name is required.");
    if (!DECISIONS.has(record.decision)) errors.push(where + ".decision must be included, excluded, or needs_review.");
    if (!Array.isArray(record.evidence)) {
      errors.push(where + ".evidence must be an array.");
      continue;
    }

    const investmentEvidence = record.evidence.some((item) =>
      item && item.claim === "direct_investment" && typeof item.url === "string" &&
      item.url.startsWith("https://") && isDate(item.eventDate) && isDate(item.accessDate)
    );
    if (record.decision === "included" && !investmentEvidence) {
      errors.push(where + " is included but lacks dated HTTPS evidence of a direct investment.");
    }

    for (const [evidenceIndex, item] of record.evidence.entries()) {
      const evidenceWhere = where + ".evidence[" + evidenceIndex + "]";
      if (!item || typeof item !== "object") {
        errors.push(evidenceWhere + " must be an object.");
        continue;
      }
      if (typeof item.claim !== "string" || !item.claim.trim()) errors.push(evidenceWhere + ".claim is required.");
      if (typeof item.url !== "string" || !item.url.startsWith("https://")) errors.push(evidenceWhere + ".url must be an HTTPS URL.");
      if (!isDate(item.accessDate)) errors.push(evidenceWhere + ".accessDate must use YYYY-MM-DD.");
      if (item.eventDate != null && !isDate(item.eventDate)) errors.push(evidenceWhere + ".eventDate must use YYYY-MM-DD or null.");
      if (item.publishedDate != null && !isDate(item.publishedDate)) errors.push(evidenceWhere + ".publishedDate must use YYYY-MM-DD or null.");
      if (typeof item.title !== "string" || !item.title.trim()) errors.push(evidenceWhere + ".title is required.");
      if (typeof item.excerpt !== "string" || !item.excerpt.trim()) errors.push(evidenceWhere + ".excerpt is required.");
    }
  }
  return errors;
}
