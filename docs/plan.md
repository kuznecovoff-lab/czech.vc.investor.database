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

## How each test is established

**Identity.** The record is tied to one organization through its official domain, the names used on that domain, and the directory listing that led to it. If the directory link, description, and name point to different organizations (for example a foreign firm with a similar name), the identity is unresolved and no facts from the other organization are attributed to the record.

**Investor type.** Prefer the manager's own description of its strategy (official site, fund disclosures such as SFDR pages) and its investment history. VC means equity or quasi-equity investments in private growth companies. Growth equity or venture debt is accepted only when the manager also invests in private growth companies and the reviewer accepts it as VC-type activity. Buyouts, controlling stakes in mature companies, crowdfunding platforms, and fund-of-funds-only activity are not VC.

**Principal operating office.** Evidence must show where the team works or the manager is run: an office or contact address on the official site, a statement such as "Prague-based" from the manager, a recipient, a public institution (for example the EIF), or a news report. A registered office, a legal footer, a registry entry, or an address labelled as a mailing address does not establish the operating office on its own. When several offices are listed and none is named as headquarters, the case needs a reviewer decision; otherwise it stays unresolved.

**Dated completed direct investment.** Prefer the recipient's or a co-investor's announcement, then the investor's own, then news media. The source must name the organization (or a fund it manages) as an investor and describe the round as completed or raised. Record the event date (closing date if stated, otherwise the announcement date, with a note), the publication date, and the access date separately. The round total is recorded as the round total; the investor's own cheque is recorded only if disclosed.

**Active window.** A record is active only with a completed direct investment dated within the 36 months before the frozen `datasetDate` (2026-10-22), that is, on or after 2023-10-22. The date is fixed by the freeze and is not moved to the date of later checks.

## Ambiguous cases

- Missing or conflicting evidence on any test gives `needs_review` as a prediction and `unresolved` as a human label, with the specific uncertainty in the reason.
- Lack of recent public announcements is recorded as missing evidence, never as proof that an organization closed or stopped investing.
- Related entities (renamed firms, successor managers, fund vehicles versus advisers) are noted on both records. They are not merged unless sources establish that they are the same manager.
- Undisclosed cheques, fund sizes, or AUM do not disqualify an investor. The field is null with a reason.
- Directory-stated or self-reported figures are labelled as such, kept separate from independently published figures, and never summed into AUM.

## Expected public-data coverage and reliability

Basis: the frozen pilot (docs/evaluation.md) and the source survey in docs/global-estimate.md.

- **Coverage of Czech VC managers in the two directories.** Of the 17 rule-drawn candidates, 2 were labelled eligible and 7 unresolved. Scaled to the 66 directory organizations outside the 3 preserved candidates, this implies about 11 eligible managers if no unresolved case qualifies and about 38 if all do, before sampling error (about 5–52 with 95% Wilson intervals). Organizations missing from both directories are not covered by this estimate.
- **Expected share of unresolved cases.** 7 of 20 (35%) could not be settled from public evidence after human review. A similar or higher share should be expected for less-documented segments (family offices, angels).
- **Field disclosure.** For the 5 eligible managers, strategy, stage, ticket, and operating office were publicly available for all 5. Firm-wide AUM was available for 1 (self-reported, undated), and no investor's individual cheque was disclosed in the 7 recorded investments. These fields should be expected to stay mostly unknown at scale.
- **Expected precision.** Measured precision was 3/3 and conservative precision 3/4 on a very small sample; any database built this way should report the conservative figure and be re-measured on a larger random sample before claiming a precision level.

## Evaluation

Freeze the candidate list and preliminary predictions before human review. Preliminary predictions (included, excluded, needs_review) are stored in data/investors.json and linked to the frozen list by `candidateId`. Human labels (eligible, not_eligible, unresolved) are stored only in data/reviews.json, with reviewer, review date, reason, and reviewed source URLs. Code never creates human labels, and a second AI pass is not independent manual review. The full protocol and metric definitions are in docs/evaluation.md.

Primary metric: precision = TP / (TP + FP). Also report a conservative precision that counts unresolved included predictions as failures, and sample recall measured only against the frozen candidate list, not against every investor in the market. needs_review predictions and unresolved labels are reported separately from the binary counts. A metric with an empty denominator is reported as unavailable, not 0%.

Also report geography/type correctness, claim-level evidence coverage, dated investment-evidence coverage, field completeness, disclosure rates for cheque/capital, conflicts, and errors.

## Global scope and cost estimate

Estimate discoverable and verifiable organizations separately by investor category and region, with lower/base/upper scenarios. Document source definitions, dates, overlap/deduplication, and disclosure limits. Association counts are not global market counts. Treat family offices and private individuals separately because public disclosure is uneven.

Measure pilot time per candidate, review share, pages checked, unresolved share, manual rework, and any actual AI/API costs. Cost model: engineering + discovery/ingestion + AI extraction + human review + infrastructure + ongoing updates. Human review formula: candidates × review share × minutes per review / 60 × hourly rate. Cite rates and tariffs with dates; label assumptions. In the pilot, time per candidate and AI/API costs were not timed or metered, so the scaling estimate uses labelled assumptions for minutes per candidate (docs/global-estimate.md).

## Deliverables and status

- README.md: summary, setup, data files, status, limitations, and AI-use account.
- docs/plan.md: this methodology.
- docs/discovery.md: discovery sources, frame selection, and preliminary predictions.
- docs/evaluation.md: human review results, confusion counts, metrics, and limits.
- docs/global-estimate.md: global investor-universe ranges and scaling effort and cost.
- docs/report.md: concise final report.
- data/candidates.json (frozen frame), data/investors.json (frozen preliminary predictions), data/reviews.json (freeze metadata and human labels), data/final-investors.json (final records for the eligible managers), data/discovery/ (directory snapshots).
- src/ and tests/: validation of all four data files, frame re-derivation, and metric calculation. Candidate records, prediction records, human labels, and final investor records use separate schemas and validators.
- ai-log/: authentic AI conversation exports, with secrets removed.

Current status (2026-10-26):

- Discovery: data/candidates.json holds the 20-organization pilot frame: the 3 earlier candidates plus 17 drawn by a seeded, name-only rule from the deduplicated union of 69 directory organizations (docs/discovery.md). Frozen on 2026-10-22.
- data/investors.json holds 20 preliminary predictions (4 included, 8 needs_review, 8 excluded), frozen on 2026-10-22. Both fingerprints are recorded in `freeze` in data/reviews.json and still match.
- Human review is complete: data/reviews.json has 20 labels (5 eligible, 8 not_eligible, 7 unresolved) entered on 2026-10-26 as confirmed by the reviewer.
- data/final-investors.json holds final records for the 5 eligible managers.
- Results: precision 3/3, conservative precision 3/4, sample recall 3/3 (docs/evaluation.md). Global ranges and scaling cost are in docs/global-estimate.md.
- Outstanding: authentic AI conversation exports in ai-log/ (see ai-log/README.md).
