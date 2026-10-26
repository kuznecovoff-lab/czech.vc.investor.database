const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DECISIONS = new Set(["included", "excluded", "needs_review"]);
const ACTIVITY_STATUSES = new Set(["active", "historical", "needs_review"]);
const CZECH_COUNTRIES = new Set(["CZ", "Czech Republic", "Czechia"]);
const ACTIVE_WINDOW_MONTHS = 36;

export const CANDIDATE_STATUSES = new Set(["candidate"]);
export const CANDIDATE_DECISIONS = new Set([
  "pending_profile_and_manual_review",
  "pending_manual_review",
  "needs_review",
  "out_of_scope"
]);

function isDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isHttps(value) {
  return typeof value === "string" && value.startsWith("https://");
}

// Earliest event date (inclusive) that counts as active for a given datasetDate.
// Day-of-month is clamped, so 2027-02-28 minus 36 months gives 2024-02-28.
export function activeWindowStart(datasetDate) {
  const [year, month, day] = datasetDate.split("-").map(Number);
  const totalMonths = year * 12 + (month - 1) - ACTIVE_WINDOW_MONTHS;
  const startYear = Math.floor(totalMonths / 12);
  const startMonth = (totalMonths % 12) + 1;
  const lastDay = new Date(Date.UTC(startYear, startMonth, 0)).getUTCDate();
  const pad = (n) => String(n).padStart(2, "0");
  return startYear + "-" + pad(startMonth) + "-" + pad(Math.min(day, lastDay));
}

function isDatedInvestment(item) {
  return item && item.claim === "direct_investment" && isHttps(item.url) &&
    isText(item.publisher) && isDate(item.eventDate) && isDate(item.accessDate);
}

export function validateDataset(dataset) {
  const errors = [];
  if (!dataset || typeof dataset !== "object" || !Array.isArray(dataset.records)) {
    return ["Dataset must be an object with a records array."];
  }
  const datasetDateValid = isDate(dataset.datasetDate);
  if (!datasetDateValid) errors.push("datasetDate must use YYYY-MM-DD.");

  const ids = new Set();
  for (const [index, record] of dataset.records.entries()) {
    const where = "records[" + index + "]";
    if (!record || typeof record !== "object") {
      errors.push(where + " must be an object.");
      continue;
    }
    if (!isText(record.id)) errors.push(where + ".id is required.");
    else if (ids.has(record.id)) errors.push(where + ".id duplicates " + record.id + ".");
    else ids.add(record.id);
    if (!isText(record.name)) errors.push(where + ".name is required.");
    if (record.candidateId != null && !isText(record.candidateId)) errors.push(where + ".candidateId must be a non-empty string.");
    if (!DECISIONS.has(record.decision)) errors.push(where + ".decision must be included, excluded, or needs_review.");
    if (record.activityStatus != null && !ACTIVITY_STATUSES.has(record.activityStatus)) {
      errors.push(where + ".activityStatus must be active, historical, needs_review, or null.");
    }
    if (!Array.isArray(record.evidence)) {
      errors.push(where + ".evidence must be an array.");
      continue;
    }

    for (const [evidenceIndex, item] of record.evidence.entries()) {
      const evidenceWhere = where + ".evidence[" + evidenceIndex + "]";
      if (!item || typeof item !== "object") {
        errors.push(evidenceWhere + " must be an object.");
        continue;
      }
      if (!isText(item.claim)) errors.push(evidenceWhere + ".claim is required.");
      if (!isHttps(item.url)) errors.push(evidenceWhere + ".url must be an HTTPS URL.");
      if (!isDate(item.accessDate)) errors.push(evidenceWhere + ".accessDate must use YYYY-MM-DD.");
      if (item.eventDate != null && !isDate(item.eventDate)) errors.push(evidenceWhere + ".eventDate must use YYYY-MM-DD or null.");
      if (item.publishedDate != null && !isDate(item.publishedDate)) errors.push(evidenceWhere + ".publishedDate must use YYYY-MM-DD or null.");
      if (!isText(item.title)) errors.push(evidenceWhere + ".title is required.");
      if (!isText(item.publisher)) errors.push(evidenceWhere + ".publisher is required.");
      if (!isText(item.excerpt)) errors.push(evidenceWhere + ".excerpt is required.");
      if (datasetDateValid && isDate(item.eventDate) && item.eventDate > dataset.datasetDate) {
        errors.push(evidenceWhere + ".eventDate is after datasetDate.");
      }
    }

    const investments = record.evidence.filter(isDatedInvestment)
      .filter((item) => !datasetDateValid || item.eventDate <= dataset.datasetDate);

    if (record.decision === "included") {
      if (!investments.length) {
        errors.push(where + " is included but lacks dated HTTPS evidence of a direct investment with a publisher.");
      }
      const office = record.operatingOffice;
      if (!office || typeof office !== "object" || !CZECH_COUNTRIES.has(office.country)) {
        errors.push(where + " is included but operatingOffice.country is not the Czech Republic.");
      }
      const officeEvidence = record.evidence.some((item) =>
        item && item.claim === "operating_office" && isHttps(item.url) && isText(item.publisher) && isDate(item.accessDate)
      );
      if (!officeEvidence) {
        errors.push(where + " is included but lacks operating_office evidence with a publisher (a registered office does not count).");
      }
    }

    if (record.activityStatus === "active" && datasetDateValid) {
      const windowStart = activeWindowStart(dataset.datasetDate);
      if (!investments.some((item) => item.eventDate >= windowStart)) {
        errors.push(where + " is labelled active but has no direct investment dated between " + windowStart + " and " + dataset.datasetDate + ".");
      }
    }
  }
  return errors;
}

const REVIEW_LABELS = new Set(["eligible", "not_eligible", "unresolved"]);
const FINGERPRINT = /^[0-9a-f]{64}$/;

// Human review labels are entered by a person; this only checks their structure.
export function validateReviews(data, candidateIds) {
  const errors = [];
  if (!data || typeof data !== "object" || !Array.isArray(data.reviews)) {
    return ["Review file must be an object with a reviews array."];
  }
  if (!isDate(data.datasetDate)) errors.push("datasetDate must use YYYY-MM-DD.");

  const freeze = data.freeze;
  if (freeze != null) {
    if (typeof freeze !== "object") errors.push("freeze must be an object or null.");
    else {
      if (freeze.frozenOn != null && !isDate(freeze.frozenOn)) errors.push("freeze.frozenOn must use YYYY-MM-DD or null.");
      for (const key of ["candidatesFingerprint", "predictionsFingerprint"]) {
        if (freeze[key] != null && !FINGERPRINT.test(freeze[key])) errors.push("freeze." + key + " must be a SHA-256 hex string or null.");
      }
    }
  }

  const seen = new Set();
  for (const [index, review] of data.reviews.entries()) {
    const where = "reviews[" + index + "]";
    if (!review || typeof review !== "object") {
      errors.push(where + " must be an object.");
      continue;
    }
    if (!isText(review.candidateId)) errors.push(where + ".candidateId is required.");
    else if (!candidateIds.has(review.candidateId)) errors.push(where + ".candidateId " + review.candidateId + " is not in the frozen candidate list.");
    else if (seen.has(review.candidateId)) errors.push(where + ".candidateId duplicates " + review.candidateId + ".");
    else seen.add(review.candidateId);
    if (!REVIEW_LABELS.has(review.label)) errors.push(where + ".label must be eligible, not_eligible, or unresolved.");
    if (!isText(review.reviewer)) errors.push(where + ".reviewer is required.");
    if (!isDate(review.reviewDate)) errors.push(where + ".reviewDate must use YYYY-MM-DD.");
    if (!isText(review.reason)) errors.push(where + ".reason is required.");
    if (!Array.isArray(review.sourceUrls) || !review.sourceUrls.length || !review.sourceUrls.every(isHttps)) {
      errors.push(where + ".sourceUrls must be a non-empty array of HTTPS URLs.");
    }
  }
  return errors;
}

const FACT_FIELDS = ["investorType", "operatingOffice", "registeredOffice", "sectorFocus", "stage", "ticket", "aum"];
const OPTIONAL_FACT_FIELDS = ["relatedEntities"];
const YEAR_MONTH = /^\d{4}-\d{2}$/;

// A fact either has a value backed by source items, or no value and a reason.
function checkFact(fact, where, sourceIds, errors) {
  if (!fact || typeof fact !== "object") {
    errors.push(where + " must be an object.");
    return;
  }
  if (fact.value == null) {
    if (!isText(fact.unavailableReason)) errors.push(where + " has no value and needs an unavailableReason.");
    return;
  }
  if (!Array.isArray(fact.sources) || !fact.sources.length) {
    errors.push(where + " has a value but no sources.");
    return;
  }
  for (const id of fact.sources) {
    if (!sourceIds.has(id)) errors.push(where + " cites unknown source item " + id + ".");
  }
}

// Final investor records: only candidates a human labelled eligible, each fact sourced.
// labelByCandidate maps candidateId to the human label from data/reviews.json.
export function validateFinalInvestors(data, labelByCandidate) {
  const errors = [];
  if (!data || typeof data !== "object" || !Array.isArray(data.records)) {
    return ["Final investor file must be an object with a records array."];
  }
  const datasetDateValid = isDate(data.datasetDate);
  if (!datasetDateValid) errors.push("datasetDate must use YYYY-MM-DD.");
  const windowStart = datasetDateValid ? activeWindowStart(data.datasetDate) : null;

  const ids = new Set();
  const covered = new Set();
  for (const [index, record] of data.records.entries()) {
    const where = "records[" + index + "]";
    if (!record || typeof record !== "object") {
      errors.push(where + " must be an object.");
      continue;
    }
    if (!isText(record.id)) errors.push(where + ".id is required.");
    else if (ids.has(record.id)) errors.push(where + ".id duplicates " + record.id + ".");
    else ids.add(record.id);
    if (!isText(record.name)) errors.push(where + ".name is required.");
    if (record.humanLabel !== "eligible") errors.push(where + ".humanLabel must be eligible.");
    if (labelByCandidate.get(record.candidateId) !== "eligible") {
      errors.push(where + ".candidateId " + record.candidateId + " has no eligible human label in data/reviews.json.");
    } else if (covered.has(record.candidateId)) {
      errors.push(where + ".candidateId duplicates " + record.candidateId + ".");
    } else {
      covered.add(record.candidateId);
    }

    const sourceIds = new Set();
    if (!Array.isArray(record.sourceItems) || !record.sourceItems.length) {
      errors.push(where + ".sourceItems must be a non-empty array.");
    } else {
      for (const [itemIndex, item] of record.sourceItems.entries()) {
        const itemWhere = where + ".sourceItems[" + itemIndex + "]";
        if (!item || typeof item !== "object") {
          errors.push(itemWhere + " must be an object.");
          continue;
        }
        if (!isText(item.id)) errors.push(itemWhere + ".id is required.");
        else if (sourceIds.has(item.id)) errors.push(itemWhere + ".id duplicates " + item.id + ".");
        else sourceIds.add(item.id);
        for (const field of ["claim", "title", "publisher", "sourceType", "excerpt"]) {
          if (!isText(item[field])) errors.push(itemWhere + "." + field + " is required.");
        }
        if (!isHttps(item.url)) errors.push(itemWhere + ".url must be an HTTPS URL.");
        if (!isDate(item.accessDate)) errors.push(itemWhere + ".accessDate must use YYYY-MM-DD.");
        for (const field of ["publishedDate", "eventDate"]) {
          if (item[field] != null && !isDate(item[field])) errors.push(itemWhere + "." + field + " must use YYYY-MM-DD or null.");
        }
        if (typeof item.userChecked !== "boolean") errors.push(itemWhere + ".userChecked must be true or false.");
      }
    }

    for (const field of FACT_FIELDS) checkFact(record[field], where + "." + field, sourceIds, errors);
    for (const field of OPTIONAL_FACT_FIELDS) {
      if (record[field] != null) checkFact(record[field], where + "." + field, sourceIds, errors);
    }
    const office = record.operatingOffice?.value;
    if (!office || !CZECH_COUNTRIES.has(office.country)) errors.push(where + ".operatingOffice.value.country must be the Czech Republic.");

    if (!Array.isArray(record.capital)) errors.push(where + ".capital must be an array.");
    else {
      for (const [capitalIndex, item] of record.capital.entries()) {
        const capitalWhere = where + ".capital[" + capitalIndex + "]";
        if (!isText(item?.metricType)) errors.push(capitalWhere + ".metricType is required.");
        checkFact(item, capitalWhere, sourceIds, errors);
      }
    }

    if (!Array.isArray(record.investments) || !record.investments.length) {
      errors.push(where + ".investments must list at least one completed direct investment.");
      continue;
    }
    for (const [investmentIndex, item] of record.investments.entries()) {
      const investmentWhere = where + ".investments[" + investmentIndex + "]";
      if (!item || typeof item !== "object") {
        errors.push(investmentWhere + " must be an object.");
        continue;
      }
      if (!isText(item.company)) errors.push(investmentWhere + ".company is required.");
      if (item.eventDate == null) {
        if (!YEAR_MONTH.test(item.eventPeriod ?? "")) errors.push(investmentWhere + " needs an eventDate or an eventPeriod (YYYY-MM).");
      } else if (!isDate(item.eventDate)) {
        errors.push(investmentWhere + ".eventDate must use YYYY-MM-DD or null.");
      } else if (datasetDateValid && item.eventDate > data.datasetDate) {
        errors.push(investmentWhere + ".eventDate is after datasetDate.");
      }
      // A round total is not the investor's cheque; an unknown cheque needs a reason.
      if (item.investorAmount == null && !isText(item.investorAmountReason)) {
        errors.push(investmentWhere + ".investorAmount is null and needs an investorAmountReason.");
      }
      checkFact({ value: item.company, sources: item.sources }, investmentWhere, sourceIds, errors);
    }

    if (record.activityStatus === "active" && windowStart) {
      const inWindow = record.investments.some((item) => isDate(item?.eventDate) &&
        item.eventDate >= windowStart && item.eventDate <= data.datasetDate);
      if (!inWindow) errors.push(where + " is labelled active but has no investment dated between " + windowStart + " and " + data.datasetDate + ".");
    }
  }

  for (const [candidateId, label] of labelByCandidate) {
    if (label === "eligible" && !covered.has(candidateId)) errors.push("Eligible candidate " + candidateId + " has no final investor record.");
  }
  return errors;
}

export function validateCandidates(data) {
  const errors = [];
  if (!data || typeof data !== "object" || !Array.isArray(data.candidates)) {
    return ["Candidate file must be an object with a candidates array."];
  }
  if (!isDate(data.discoveryDate)) errors.push("discoveryDate must use YYYY-MM-DD.");

  const ids = new Set();
  for (const [index, candidate] of data.candidates.entries()) {
    const where = "candidates[" + index + "]";
    if (!candidate || typeof candidate !== "object") {
      errors.push(where + " must be an object.");
      continue;
    }
    if (!isText(candidate.id)) errors.push(where + ".id is required.");
    else if (ids.has(candidate.id)) errors.push(where + ".id duplicates " + candidate.id + ".");
    else ids.add(candidate.id);
    if (!isText(candidate.name)) errors.push(where + ".name is required.");
    if (!CANDIDATE_STATUSES.has(candidate.status)) errors.push(where + ".status must be candidate.");
    if (!CANDIDATE_DECISIONS.has(candidate.decision)) {
      errors.push(where + ".decision must be one of: " + [...CANDIDATE_DECISIONS].join(", ") + ".");
    }
    if (!Array.isArray(candidate.discoverySources) || !candidate.discoverySources.length) {
      errors.push(where + ".discoverySources must be a non-empty array.");
    } else {
      for (const [sourceIndex, source] of candidate.discoverySources.entries()) {
        if (!source || !isText(source.source) || !isHttps(source.sourceUrl) || !isHttps(source.listingUrl)) {
          errors.push(where + ".discoverySources[" + sourceIndex + "] needs source, HTTPS sourceUrl, and HTTPS listingUrl.");
        }
      }
    }
    if (!Array.isArray(candidate.evidence)) {
      errors.push(where + ".evidence must be an array.");
      continue;
    }

    for (const [evidenceIndex, item] of candidate.evidence.entries()) {
      const evidenceWhere = where + ".evidence[" + evidenceIndex + "]";
      if (!item || typeof item !== "object") {
        errors.push(evidenceWhere + " must be an object.");
        continue;
      }
      if (!isText(item.claim)) errors.push(evidenceWhere + ".claim is required.");
      if (!isText(item.sourceTitle)) errors.push(evidenceWhere + ".sourceTitle is required.");
      if (!isText(item.publisher)) errors.push(evidenceWhere + ".publisher is required.");
      if (!isHttps(item.url)) errors.push(evidenceWhere + ".url must be an HTTPS URL.");
      if (!isDate(item.accessDate)) errors.push(evidenceWhere + ".accessDate must use YYYY-MM-DD.");
      if (item.eventDate != null && !isDate(item.eventDate)) errors.push(evidenceWhere + ".eventDate must use YYYY-MM-DD or null.");
      if (item.publishedDate != null && !isDate(item.publishedDate)) errors.push(evidenceWhere + ".publishedDate must use YYYY-MM-DD or null.");
      if (!isText(item.excerpt)) errors.push(evidenceWhere + ".excerpt is required.");
      if (item.manualVerification != null) {
        const review = item.manualVerification;
        if (typeof review !== "object" || !isText(review.reviewer) || !isDate(review.date) || !isText(review.method)) {
          errors.push(evidenceWhere + ".manualVerification needs reviewer, date (YYYY-MM-DD), and method.");
        }
      }
    }
  }
  return errors;
}
