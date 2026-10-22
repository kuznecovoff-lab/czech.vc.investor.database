# Project plan

## Goal

Build a small, reproducible public-data pilot for a reliable investor database. The submission will include a written method, a source-backed Czech VC sample, a manual quality measurement, a bounded global-scale estimate, lightweight validation/evaluation code, Git history, and authentic AI-use logs.

## Scope and unit of record

The broader database concept covers VC, private equity, family offices, angel investors, and large private investors that invest directly in companies. The pilot covers VC managers whose principal operating office is in the Czech Republic. A foreign organization investing in a Czech startup is not in scope solely for that reason.

The unit of record is the VC manager (the organization that makes investment decisions). Related funds and vehicles (for example, Fund I, Fund II, or an SPV) are linked to the manager record and are not counted as separate investors.

Czech geography is determined by the principal operating office: the place where the team works and the manager is run. A registered office is stored separately. A registered address alone does not prove the operating office; when only a registered address is documented, the case stays needs_review for geography.

Target sample: approximately 15–25 confirmed organizations if public evidence supports that many. This is a working target, not an estimate of the total Czech market. The inclusion rules will not be relaxed to meet the target.

## Inclusion rules

An organization can be included only when:

1. Its identity and Czech principal operating office are supported by a public source that names a clear publisher.
2. A dated public source identifies it as an investor in a completed direct investment into a company. Prefer the investor's own announcement or the recipient company's announcement.
3. Its activity fits venture capital: its stated strategy and/or investment history supports investing in private growth companies.
4. To use the active label, a completed direct investment must have an event date within the 36 months before the frozen dataset date (`datasetDate`), and a current strategy must be available. The window is calculated from `datasetDate`, not from the date the checks are run. Otherwise, keep the record as historical or needs_review, not active.
5. There is no unresolved identity conflict that could make the record a different organization.

Investor-type clarifications:

- Corporate VC and state-backed VC vehicles qualify only if they make direct equity or quasi-equity investments (for example, convertible loans or other instruments that convert into equity) in companies. Lending-only, guarantee-only, or fund-of-funds activity does not qualify.
- Accelerators qualify only when they invest directly in companies. Grant-only programs do not qualify.
- Borderline or insufficiently documented cases remain needs_review. They are not included to reach the sample target.

## Exclusions and unresolved cases

Exclude directories, associations, advisors, banks, brokers, law firms, accelerators without direct investment evidence, ordinary operating companies without evidence of investment activity, LP-only entities, and organizations outside the pilot geography. PE-only funds, family offices, and individual angels are outside this pilot, though they belong to the broader concept.

Use needs_review when evidence is missing or contradictory. Lack of a recent announcement is not proof that an organization stopped investing. Missing cheque or capital figures do not disqualify a real investor; record them as unknown with a reason.

## Fields and source policy

Record identity, official domain, investor type, principal operating office (`operatingOffice`), registered office if documented (`registeredOffice`, kept separate), linked funds, strategy, sectors, stages, investment geography, typical initial cheque (with currency), capital metrics, activity status, and inclusion decision.

Every material claim needs a linked evidence item containing the source URL, title, publisher, claim/field, publication date if available, event date if relevant, access date, and a short excerpt or exact page location. Keep publication date distinct from access date. If a source does not support a publication date, record it as null. Do not mark a date as suspicious unless a source shows it is wrong. Undated strategy pages may support current stated strategy but do not establish a dated investment event.

Distinguish fund size, target fund size, first/final close, AUM, aggregate historical investment, and available capital. Do not add historical fund sizes to infer AUM or treat a startup round total as one investor's cheque.

Use association and ecosystem directories only to discover candidates. Membership alone and search snippets are not sufficient proof. Prefer primary public sources; do not bypass paywalls or access controls. Cache only what is needed to reproduce the facts and respect source terms and request limits.

## Candidate discovery and verification workflow

1. Freeze and save candidate lists from public discovery sources. For the Czech pilot, start with the [CzechStartups investor directory](https://czechstartups.gov.cz/en/startup-ecosystem/investors/), its [venture capital overview](https://czechstartups.gov.cz/en/startup-ecosystem/capital/venture-capital/), and the [CVCA member directory](https://cvca.cz/en/membership/). These are discovery frames only: the government directory spans multiple investor types, while CVCA also has associated members and PE firms. Neither directory entry nor membership proves an organization's direct investments.
2. Normalize names and domains; manually resolve duplicates and related funds.
3. Inspect official strategy and portfolio pages.
4. Find a dated completed investment announcement from the investor or recipient.
5. Check office/identity using official pages and public registries where useful. A registry confirms legal identity and registered office, not the operating office or investment activity.
6. Save evidence for each material claim and record inclusion, exclusion, or unresolved reason.
7. Manually review all pilot candidates, including excluded and unresolved candidates.

## Evaluation

Freeze the candidate list and preliminary predictions before human review. Preliminary predictions (included, excluded, needs_review) are stored in data/investors.json and linked to the frozen list by `candidateId`. Human labels (eligible, not_eligible, unresolved) are stored only in data/reviews.json, with reviewer, review date, reason, and reviewed source URLs. Code never creates human labels, and a second AI pass is not independent manual review. The full protocol and metric definitions are in docs/evaluation.md.

Primary metric: precision = TP / (TP + FP). Also report a conservative precision that counts unresolved included predictions as failures, and sample recall measured only against the frozen candidate list, not against every investor in the market. needs_review predictions and unresolved labels are reported separately from the binary counts. A metric with an empty denominator is reported as unavailable, not 0%.

Also report geography/type correctness, claim-level evidence coverage, dated investment-evidence coverage, field completeness, disclosure rates for cheque/capital, conflicts, and errors.

## Global scope and cost estimate

Estimate discoverable and verifiable organizations separately by investor category and region, with lower/base/upper scenarios. Document source definitions, dates, overlap/deduplication, and disclosure limits. Association counts are not global market counts. Treat family offices and private individuals separately because public disclosure is uneven.

Measure pilot time per candidate, review share, pages checked, unresolved share, manual rework, and any actual AI/API costs. Cost model: engineering + discovery/ingestion + AI extraction + human review + infrastructure + ongoing updates. Human review formula: candidates × review share × minutes per review / 60 × hourly rate. Cite rates and tariffs with dates; label assumptions.

## Deliverables and status

- README.md: English summary, setup, method, AI-use notes, final results and limitations.
- docs/plan.md: this methodology.
- docs/evaluation.md: frozen sample, human review protocol, metrics and results.
- docs/global-estimate.md: sourced global scenarios and cost model.
- data/: candidate, investor, evidence, and manual-review records.
- src/ and tests/: repeatable validation and metric calculation. Candidate records (data/candidates.json) and final investor records (data/investors.json) use separate schemas and validators; candidates are not forced into the final schema.
- ai-log/: authentic AI conversation exports, with secrets removed.

Current status (2026-10-22):

- Discovery: both directories were captured as snapshots in data/discovery/. data/candidates.json holds a 20-organization pilot frame: the 3 earlier candidates plus 17 drawn by a seeded, name-only rule from the deduplicated union of 69 organizations. Method and limitations are in docs/discovery.md. The frame is **not frozen**.
- data/investors.json holds 20 preliminary predictions: 4 included (Credo Ventures, Tilia Impact Ventures, Purple Ventures, PurposeTech), 8 needs_review, 8 excluded. None has been human-reviewed.
- Source-level manual checks recorded in data/candidates.json (`manualVerification`) exist only for the original 3 candidates:
  - Credo: direct investment, Prague office, and Fund V size are checked; the strategy/stage/ticket evidence is not.
  - Tilia: the original five evidence items are checked; the Lifeyear article added on 2026-10-22 is not.
  - Purple: direct investment, strategy, and Fund II launch target are checked; the registered-office evidence, the homepage operating-office evidence added on 2026-10-22, and the 2026 fundraising update are not.
  These are checks of individual sources, not human eligibility labels. No source for the 17 new candidates has been manually checked.
- data/reviews.json has 0 human labels, and its freeze fingerprints are unset.
- No precision, recall, or global count is claimed. docs/global-estimate.md has not been started.

Next: a human reviews the frame and predictions, the candidate list and predictions are frozen with `npm run fingerprint`, a human labels every candidate in data/reviews.json, then run `npm run evaluate`.
