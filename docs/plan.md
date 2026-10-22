# Project plan

## Goal

Build a small, reproducible public-data pilot for a reliable investor database. The submission will include a written method, a source-backed Czech VC sample, a manual quality measurement, a bounded global-scale estimate, lightweight validation/evaluation code, Git history, and authentic AI-use logs.

## Scope and unit of record

The broader database concept covers VC, private equity, family offices, angel investors, and large private investors that invest directly in companies. The pilot covers VC organizations whose main operating office is in the Czech Republic. A foreign organization investing in a Czech startup is not in scope solely for that reason. The record represents the investment organization or manager; affiliated funds are linked, not counted as separate investors.

Target sample: approximately 15–25 confirmed organizations if public evidence supports that many. This is a working target, not an estimate of the total Czech market. The inclusion rules will not be relaxed to meet the target.

## Inclusion rules

An organization can be included only when:

1. Its identity and Czech main operating office are supported by a public source.
2. A dated public source identifies it as an investor in a completed direct investment into a company. Prefer the investor's own announcement or the recipient company's announcement.
3. Its activity fits venture capital: its stated strategy and/or investment history supports investing in private growth companies.
4. To use the active label, the dated investment is within 36 months before the frozen dataset date and a current strategy is available. Otherwise, retain it as historical or needs-review, not active.
5. There is no unresolved identity conflict that could make the record a different organization.

## Exclusions and unresolved cases

Exclude directories, associations, advisors, banks, brokers, law firms, accelerators without direct investment evidence, ordinary operating companies without evidence of investment activity, LP-only entities, and organizations outside the pilot geography. PE-only funds, family offices, and individual angels are outside this pilot, though they belong to the broader concept.

Use needs_review when evidence is missing or contradictory. Lack of a recent announcement is not proof that an organization stopped investing. Missing cheque or capital figures do not disqualify a real investor; record them as unknown with a reason.

## Fields and source policy

Record identity, official domain, investor type, main office, strategy, sectors, stages, investment geography, typical initial cheque (with currency), capital metrics, activity status, and inclusion decision.

Every material claim needs a linked evidence item containing the source URL, title, publisher, claim/field, publication date if available, event date if relevant, access date, and a short excerpt or exact page location. Keep publication date distinct from access date. Undated strategy pages may support current stated strategy but do not establish a dated investment event.

Distinguish fund size, target fund size, first/final close, AUM, aggregate historical investment, and available capital. Do not add historical fund sizes to infer AUM or treat a startup round total as one investor's cheque.

Use association and ecosystem directories only to discover candidates. Membership alone and search snippets are not sufficient proof. Prefer primary public sources; do not bypass paywalls or access controls. Cache only what is needed to reproduce the facts and respect source terms and request limits.

## Candidate discovery and verification workflow

1. Freeze and save candidate lists from public discovery sources.
2. Normalize names and domains; manually resolve duplicates and related funds.
3. Inspect official strategy and portfolio pages.
4. Find a dated completed investment announcement from the investor or recipient.
5. Check office/identity using official pages and public registries where useful. A registry confirms legal identity, not investment activity.
6. Save evidence for each material claim and record inclusion, exclusion, or unresolved reason.
7. Manually review all pilot candidates, including excluded and unresolved candidates.

## Evaluation

Freeze predictions before human review. The human review table is the reference label; a second AI pass is not independent manual review.

Primary metric: precision of included records = TP / (TP + FP), where TP is a predicted inclusion confirmed by manual review and FP is a predicted inclusion rejected by manual review. Show counts and denominator. Report unresolved included cases U separately and also show the conservative lower estimate TP / (TP + FP + U).

Also report geography/type correctness, claim-level evidence coverage, dated investment-evidence coverage, field completeness, disclosure rates for cheque/capital, conflicts, and errors. Recall may be reported only against the frozen candidate list, not against every investor in the world.

## Global scope and cost estimate

Estimate discoverable and verifiable organizations separately by investor category and region, with lower/base/upper scenarios. Document source definitions, dates, overlap/deduplication, and disclosure limits. Association counts are not global market counts. Treat family offices and private individuals separately because public disclosure is uneven.

Measure pilot time per candidate, review share, pages checked, unresolved share, manual rework, and any actual AI/API costs. Cost model: engineering + discovery/ingestion + AI extraction + human review + infrastructure + ongoing updates. Human review formula: candidates × review share × minutes per review / 60 × hourly rate. Cite rates and tariffs with dates; label assumptions.

## Deliverables and status

- README.md: English summary, setup, method, AI-use notes, final results and limitations.
- docs/plan.md: this methodology.
- docs/evaluation.md: frozen sample, human review protocol, metrics and results.
- docs/global-estimate.md: sourced global scenarios and cost model.
- data/: candidate, investor, evidence, and manual-review records.
- src/ and tests/: repeatable validation and metric calculation.
- ai-log/: authentic AI conversation exports, with secrets removed.

Current status: scaffold created; no pilot records have yet passed evidence review, so no precision or global count is claimed.
