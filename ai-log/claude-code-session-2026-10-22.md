> We are working on Assignment A: a reliable database of Czech venture capital
> investors.

First read README.md, docs/plan.md, docs/evaluation.md, data/candidates.json,
data/investors.json, src/, and tests/.

Do not edit any files yet. Review the project and report:

1. Whether the inclusion and exclusion rules match the assignment.
2. Which data and deliverables are still missing.
3. How candidate discovery and preliminary checks could be automated while
   keeping human review for factual verification and precision measurement.
4. A concrete sequence of next steps and the files each step should produce.

Do not invent investors, facts, or sources. Do not call a claim verified
unless the project contains supporting evidence. Reply in English, concisely,
and reference project file paths.

● I'll start by listing the project files.

Ran 5 shell commands (ctrl+o to expand)

● I reviewed the project at investor-database-latest/ without editing anything.
npm test passes all 5 tests. validate and evaluate both run, but only on empty
data (0 records).

Caveat: the original Assignment A brief isn't in the project. So for point 1 I
checked the rules against the assignment as README.md and docs/plan.md
restate it, not against the brief itself.

1. Inclusion and exclusion rules

The rules in docs/plan.md (Inclusion rules / Exclusions) fit a "reliable Czech
VC database" well: Czech main office, a dated direct investment, a VC-type
strategy, a 36-month active window, and directories used only for discovery.
Gaps and inconsistencies:

- Main office vs registered office. The rule says "main operating office", but
  Purple's only office evidence is the registered office (Brno) from a
  privacy policy (data/candidates.json, main_office_and_legal_identity). It is
  also the one office claim with no manualVerification.
- Firms with several offices. There is no rule for deciding which office is
  "main" for CEE firms with offices in more than one country.
- Borderline investor types are undecided: corporate VC, state-backed funds
  (government or EU-funded), accelerators that invest, angel clubs or
  syndicates, and evergreen or holding vehicles. The CVCA list will produce
  all of these.
- Fund linkage. The plan says related funds are "linked, not counted", but the
  schema has no field for funds or their manager.
- The 36-month rule is checked by hand only. The Delta Green event
  (2024-05-27) is inside the window for 2026-10-22, but no code enforces this.

2. Missing data and deliverables

- Discovery frame: none of the three named sources (CzechStartups directory,
  CzechStartups VC overview, CVCA) has been captured. The 3 candidates all
  come from one announcement, which docs/plan.md already admits.
- Data files: data/investors.json and data/reviews.json are empty. There is no
  frozen prediction set.
- Schema mismatch: candidates use sourceTitle, but src/validate.js requires
  title. Candidate decision: "pending_profile_and_manual_review" isn't an
  allowed value. publisher, which the plan requires, isn't checked, and
  nothing validates candidates.json at all.
- Evidence that can't be reproduced:
  - Credo's fund-size source is the LinkedIn company page URL, not a link to
    the post itself.
  - The screenshots behind the manual checks sit in upload/, which is excluded
    from Git by .gitignore and doesn't exist locally. Reviewers have nothing
    to check against.
  - Tilia's criteria come from an Airtable form, which may change or
    disappear.
- Dates to re-check by hand: Delta Green's publishedDate is 2024-10-22,
  exactly two years before the access date. Purple's privacy policy is dated
  2023-01-01. Both look like placeholders, though they may be correct.
- The docs disagree with each other and with the data. docs/plan.md says Tilia
  and Purple profile claims "still require manual review", but the data marks
  most Tilia claims and Purple's strategy as user-checked. docs/evaluation.md
  says Credo "profile details" were checked, but Credo's strategy/ticket
  evidence has no manualVerification.
- Code gaps:
  - Review records have no fields for reviewer, date, reason or source.
  - There is no recall against the frozen list.
  - No code calculates evidence coverage or field completeness.
  - Nothing measures time spent per candidate.
- Deliverables not started:
  - Evaluation results (docs/evaluation.md).
  - The global estimate and cost model (docs/global-estimate.md).
  - AI conversation exports (ai-log/ holds only a README).
  - Final results and limitations in README.md.

3. Automation while keeping human review

Automate (machine output is always marked unverified):

- Fetch the directories: save the three sources to
  data/discovery/<source>-<date>.json with a raw snapshot hash, respecting
  each site's terms and rate limits.
- Normalize and deduplicate: group candidates by domain or name and flag
  possible duplicates for a person to decide.
- Preliminary checks:
  - Is the website up?
  - Does the contact page show a Czech address or postcode?
  - Can the legal identity be confirmed through a lookup in ARES, the public
    Czech business register? This confirms identity, not investment activity.
  - Are there portfolio or news pages?
  - Do recipient announcements name the investor and carry a date?
  - Is the latest event inside the 36-month window?
- Draft evidence items: the machine fills URL, title, date and excerpt, and
  leaves manualVerification empty.
- Stricter validator: an included record must have human-verified
  direct_investment and main_office evidence, a Czech country, an event date
  inside the window, and a publisher.

Keep human:

- Opening each source and confirming the claim and dates.
- Deciding identity, office and type in borderline cases.
- The final label.

To keep the precision measurement honest:

1. Freeze predictions first (a Git tag plus a hash of investors.json).
2. The human reviews every predicted inclusion (or a random sample with a
   fixed seed, if the set gets large) into reviews.json, without seeing AI
   confidence scores.
3. Never let an AI pass count as a review.

4. Next steps and the files each produces

#: 1
Step: Add the decisions on borderline types, operating vs registered office,
and fund linkage
Files: docs/plan.md
────────────────────────────────────────
#: 2
Step: Define one candidate/investor schema; make the validator cover
candidates.json; add the stricter rules and tests
Files: docs/schema.md, src/validate.js, tests/validate.test.js
────────────────────────────────────────
#: 3
Step: Capture and freeze the discovery frames
Files: src/discover.js, data/discovery/czechstartups-2026-10-22.json,
data/discovery/cvca-2026-10-22.json
────────────────────────────────────────
#: 4
Step: Merge and deduplicate into the frozen candidate list, with discovery
source per row
Files: src/normalize.js, data/candidates.json
────────────────────────────────────────
#: 5
Step: Run the automated checks and draft evidence
Files: src/precheck.js, data/prechecks.json
────────────────────────────────────────
#: 6
Step: Human verification per candidate; fix the Credo LinkedIn link and the
two
suspicious dates; save archived links or committed evidence for screenshots
Files: data/candidates.json, data/evidence/ (or archive URLs)
────────────────────────────────────────
#: 7
Step: Freeze predictions (included / excluded / needs_review)
Files: data/investors.json, Git tag predictions-frozen
────────────────────────────────────────
#: 8
Step: Human reference labels, with reviewer, date, reason and minutes spent
Files: data/reviews.json
────────────────────────────────────────
#: 9
Step: Calculate precision, the conservative estimate, coverage, completeness
and recall against the frozen list
Files: src/evaluate.js, tests/evaluate.test.js, docs/evaluation.md
────────────────────────────────────────
#: 10
Step: Write the global estimate and cost model from the measured pilot effort
and cited sources
Files: docs/global-estimate.md
────────────────────────────────────────
#: 11
Step: Add the AI conversation exports; update the README with results, AI
errors seen, and limitations
Files: ai-log/\*, README.md

Nothing in the project yet supports calling any of the three candidates a
verified, included record. Credo, Tilia and Purple have partial manual checks,
as each manualVerification entry records.

> Apply a focused update based on your read-only audit. The pilot remains Czech
> venture capital investors. Do not search the web or create inclusion
> decisions.

1. Update docs/plan.md to clarify:

- The unit of record is the VC manager; related funds are linked and not
  counted as separate investors.
- Use the principal operating office for Czech geography. Store a registered
  office separately; a registered address alone does not prove the operating
  office.
- Corporate or state-backed VC vehicles qualify only if they make direct
  equity or quasi-equity investments. Accelerators qualify only when they
  directly invest; grant-only programs do not.
- Keep borderline or insufficiently documented cases as needs_review.
- A completed direct investment must have an event date within the 36-month
  active window to receive the active label.

2. Keep candidate and final investor records as separate schemas. Add
   validation for data/candidates.json instead of forcing it to match the final
   investor schema. Validate allowed candidate decisions and required source
   fields.
3. Strengthen final investor validation for included records: require dated
   direct-investment evidence, evidence for the Czech operating office, and a
   clear source publisher. Make the 36-month check use datasetDate, not the
   machine’s current date.
4. Update and add tests for these rules. Do not add real investor records or
   manual-review labels.
5. Do not mark a date suspicious unless a source provides evidence that it is
   wrong. If a publication date is not supported, leave it null.

Run npm test and npm run validate. Summarize changed files, test results, and
any remaining limitations. Do not commit.

● Applying the changes. First, the methodology in docs/plan.md.

● Update(docs\plan.md)
⎿  Added 5 lines, removed 1 line
6  
 7 ## Scope and unit of record
8  
 9 -The broader database concept covers VC, private equity, family
-offices, angel investors, and large private investors that inve
-st directly in companies. The pilot covers VC organizations who
-se main operating office is in the Czech Republic. A foreign or
-ganization investing in a Czech startup is not in scope solely
-for that reason. The record represents the investment organizat
-ion or manager; affiliated funds are linked, not counted as sep
-arate investors.  
 9 +The broader database concept covers VC, private equity, family
+offices, angel investors, and large private investors that inve
+st directly in companies. The pilot covers VC managers whose pr
+incipal operating office is in the Czech Republic. A foreign or
+ganization investing in a Czech startup is not in scope solely
+for that reason.  
 10  
 11 +The unit of record is the VC manager (the organization that mak
+es investment decisions). Related funds and vehicles (for examp
+le, Fund I, Fund II, or an SPV) are linked to the manager recor
+d and are not counted as separate investors.  
 12 +  
 13 +Czech geography is determined by the principal operating office
+: the place where the team works and the manager is run. A regi
+stered office is stored separately. A registered address alone
+does not prove the operating office; when only a registered add
+ress is documented, the case stays needs_review for geography.
14 +  
 15 Target sample: approximately 15–25 confirmed organizations if p
ublic evidence supports that many. This is a working target, no
t an estimate of the total Czech market. The inclusion rules wi
ll not be relaxed to meet the target.
16  
 17 ## Inclusion rules

● Update(docs\plan.md)
⎿  Added 8 lines, removed 2 lines
18  
 19 An organization can be included only when:
20  
 21 -1. Its identity and Czech main operating office are supported b
-y a public source.  
 21 +1. Its identity and Czech principal operating office are suppor
+ted by a public source that names a clear publisher.  
 22 2. A dated public source identifies it as an investor in a comp
leted direct investment into a company. Prefer the investor's o
wn announcement or the recipient company's announcement.
23 3. Its activity fits venture capital: its stated strategy and/o
r investment history supports investing in private growth compa
nies.
24 -4. To use the active label, the dated investment is within 36 m
-onths before the frozen dataset date and a current strategy is
-available. Otherwise, retain it as historical or needs-review,
-not active.  
 24 +4. To use the active label, a completed direct investment must
+have an event date within the 36 months before the frozen datas
+et date (`datasetDate`), and a current strategy must be availab
+le. The window is calculated from `datasetDate`, not from the d
+ate the checks are run. Otherwise, keep the record as historica
+l or needs_review, not active.  
 25 5. There is no unresolved identity conflict that could make the
record a different organization.
26  
 27 +Investor-type clarifications:  
 28 +  
 29 +- Corporate VC and state-backed VC vehicles qualify only if the
+y make direct equity or quasi-equity investments (for example,
+convertible loans or other instruments that convert into equity
+) in companies. Lending-only, guarantee-only, or fund-of-funds
+activity does not qualify.  
 30 +- Accelerators qualify only when they invest directly in compan
+ies. Grant-only programs do not qualify.  
 31 +- Borderline or insufficiently documented cases remain needs_re
+view. They are not included to reach the sample target.  
 32 +  
 33 ## Exclusions and unresolved cases
34  
 35 Exclude directories, associations, advisors, banks, brokers, la
w firms, accelerators without direct investment evidence, ordin
ary operating companies without evidence of investment activity
, LP-only entities, and organizations outside the pilot geograp
hy. PE-only funds, family offices, and individual angels are ou
tside this pilot, though they belong to the broader concept.

● Update(docs\plan.md)
⎿  Added 1 line, removed 1 line
38  
 39 ## Fields and source policy
40  
 41 -Record identity, official domain, investor type, main office, s
-trategy, sectors, stages, investment geography, typical initial - cheque (with currency), capital metrics, activity status, and
-inclusion decision.  
 41 +Record identity, official domain, investor type, principal oper
+ating office (`operatingOffice`), registered office if document
+ed (`registeredOffice`, kept separate), linked funds, strategy, + sectors, stages, investment geography, typical initial cheque
+(with currency), capital metrics, activity status, and inclusio
+n decision.  
 42  
 43 Every material claim needs a linked evidence item containing th
e source URL, title, publisher, claim/field, publication date i
f available, event date if relevant, access date, and a short e
xcerpt or exact page location. Keep publication date distinct f
rom access date. Undated strategy pages may support current sta
ted strategy but do not establish a dated investment event.
44

● Update(docs\plan.md)
⎿  Added 1 line, removed 1 line
40  
 41 Record identity, official domain, investor type, principal oper
ating office (`operatingOffice`), registered office if document
ed (`registeredOffice`, kept separate), linked funds, strategy,
sectors, stages, investment geography, typical initial cheque
(with currency), capital metrics, activity status, and inclusio
n decision.
42  
 43 -Every material claim needs a linked evidence item containing th
-e source URL, title, publisher, claim/field, publication date i
-f available, event date if relevant, access date, and a short e
-xcerpt or exact page location. Keep publication date distinct f
-rom access date. Undated strategy pages may support current sta
-ted strategy but do not establish a dated investment event.  
 43 +Every material claim needs a linked evidence item containing th
+e source URL, title, publisher, claim/field, publication date i
+f available, event date if relevant, access date, and a short e
+xcerpt or exact page location. Keep publication date distinct f
+rom access date. If a source does not support a publication dat
+e, record it as null. Do not mark a date as suspicious unless a + source shows it is wrong. Undated strategy pages may support c
+urrent stated strategy but do not establish a dated investment
+event.  
 44  
 45 Distinguish fund size, target fund size, first/final close, AUM
, aggregate historical investment, and available capital. Do no
t add historical fund sizes to infer AUM or treat a startup rou
nd total as one investor's cheque.
46

● Update(docs\plan.md)
⎿  Added 1 line, removed 1 line
52 2. Normalize names and domains; manually resolve duplicates and
related funds.
53 3. Inspect official strategy and portfolio pages.
54 4. Find a dated completed investment announcement from the inve
stor or recipient.
55 -5. Check office/identity using official pages and public regist
-ries where useful. A registry confirms legal identity, not inve
-stment activity.  
 55 +5. Check office/identity using official pages and public regist
+ries where useful. A registry confirms legal identity and regis
+tered office, not the operating office or investment activity.
56 6. Save evidence for each material claim and record inclusion,
exclusion, or unresolved reason.
57 7. Manually review all pilot candidates, including excluded and
unresolved candidates.
58

● Update(docs\plan.md)
⎿  Added 1 line, removed 1 line
77 - docs/evaluation.md: frozen sample, human review protocol, met
rics and results.
78 - docs/global-estimate.md: sourced global scenarios and cost mo
del.
79 - data/: candidate, investor, evidence, and manual-review recor
ds.
80 -- src/ and tests/: repeatable validation and metric calculation
-.  
 80 +- src/ and tests/: repeatable validation and metric calculation
+. Candidate records (data/candidates.json) and final investor r
+ecords (data/investors.json) use separate schemas and validator
+s; candidates are not forced into the final schema.  
 81 - ai-log/: authentic AI conversation exports, with secrets remo
ved.
82  
 83 Current status (2026-10-22): first-pass public profiles and dat
ed investment evidence are collected for Credo Ventures, Tilia
Impact Ventures, and Purple Ventures. The direct-investment evi
dence is the same recipient announcement, so candidate discover
y is not independent and the sample is not representative. The
user has manually checked Credo's Prague address and its Stage
V announcement; Tilia and Purple profile claims still require m
anual review. No precision or global count is claimed. Next, br
oaden discovery beyond investors in the Delta Green round, free
ze the candidate list, manually label inclusions/exclusions/unr
esolved cases, then calculate precision.

● Now the validators: the final investor schema gets stricter, and candidates
get their own schema.

● Write(src\validate.js)
⎿  Added 131 lines, removed 15 lines
1 const ISO*DATE = /^\d{4}-\d{2}-\d{2}$/;
2 const DECISIONS = new Set(["included", "excluded", "needs_revie
w"]);
3 +const ACTIVITY_STATUSES = new Set(["active", "historical", "nee
+ds_review"]);  
 4 +const CZECH_COUNTRIES = new Set(["CZ", "Czech Republic", "Czech
+ia"]);  
 5 +const ACTIVE_WINDOW_MONTHS = 36;  
 6  
 7 +export const CANDIDATE_STATUSES = new Set(["candidate"]);  
 8 +export const CANDIDATE_DECISIONS = new Set([
9 + "pending_profile_and_manual_review",
10 + "pending_manual_review",
11 + "needs_review",
12 + "out_of_scope"
13 +]);  
 14 +  
 15 function isDate(value) {
5 - return typeof value === "string" && ISO_DATE.test(value) && !
-Number.isNaN(Date.parse(value + "T00:00:00Z"));  
 16 + if (typeof value !== "string" || !ISO_DATE.test(value)) retur
+n false;  
 17 + const parsed = new Date(value + "T00:00:00Z");  
 18 + return !Number.isNaN(parsed.getTime()) && parsed.toISOString(
+).slice(0, 10) === value;  
 19 }
20  
 21 +function isText(value) {  
 22 + return typeof value === "string" && value.trim() !== "";  
 23 +}  
 24 +  
 25 +function isHttps(value) {  
 26 + return typeof value === "string" && value.startsWith("https:/
+/");  
 27 +}  
 28 +  
 29 +// Earliest event date (inclusive) that counts as active for a
+given datasetDate.  
 30 +// Day-of-month is clamped, so 2027-02-28 minus 36 months gives + 2024-02-28.  
 31 +export function activeWindowStart(datasetDate) {  
 32 + const [year, month, day] = datasetDate.split("-").map(Number)
+;  
 33 + const totalMonths = year \* 12 + (month - 1) - ACTIVE_WINDOW_M
+ONTHS;  
 34 + const startYear = Math.floor(totalMonths / 12);  
 35 + const startMonth = (totalMonths % 12) + 1;  
 36 + const lastDay = new Date(Date.UTC(startYear, startMonth, 0)).
+getUTCDate();  
 37 + const pad = (n) => String(n).padStart(2, "0");  
 38 + return startYear + "-" + pad(startMonth) + "-" + pad(Math.min
+(day, lastDay));  
 39 +}  
 40 +  
 41 +function isDatedInvestment(item) {  
 42 + return item && item.claim === "direct_investment" && isHttps(
+item.url) &&  
 43 + isText(item.publisher) && isDate(item.eventDate) && isDate(
+item.accessDate);  
 44 +}  
 45 +  
 46 export function validateDataset(dataset) {
47 const errors = [];
48 if (!dataset || typeof dataset !== "object" || !Array.isArray
(dataset.records)) {
49 return ["Dataset must be an object with a records array."];
50 }
13 - if (!isDate(dataset.datasetDate)) errors.push("datasetDate mu
-st use YYYY-MM-DD.");  
 51 + const datasetDateValid = isDate(dataset.datasetDate);  
 52 + if (!datasetDateValid) errors.push("datasetDate must use YYYY
+-MM-DD.");  
 53  
 54 const ids = new Set();
55 for (const [index, record] of dataset.records.entries()) {
...
58 errors.push(where + " must be an object.");
59 continue;
60 }
22 - if (typeof record.id !== "string" || !record.id.trim()) er
-rors.push(where + ".id is required.");  
 61 + if (!isText(record.id)) errors.push(where + ".id is requir
+ed.");  
 62 else if (ids.has(record.id)) errors.push(where + ".id dupl
icates " + record.id + ".");
63 else ids.add(record.id);
25 - if (typeof record.name !== "string" || !record.name.trim()
-) errors.push(where + ".name is required.");  
 64 + if (!isText(record.name)) errors.push(where + ".name is re
+quired.");  
 65 if (!DECISIONS.has(record.decision)) errors.push(where + "
.decision must be included, excluded, or needs_review.");
66 + if (record.activityStatus != null && !ACTIVITY_STATUSES.ha
+s(record.activityStatus)) {  
 67 + errors.push(where + ".activityStatus must be active, his
+torical, needs_review, or null.");  
 68 + }  
 69 if (!Array.isArray(record.evidence)) {
70 errors.push(where + ".evidence must be an array.");
71 continue;
72 }
73  
 32 - const investmentEvidence = record.evidence.some((item) =>
33 - item && item.claim === "direct_investment" && typeof ite
-m.url === "string" &&  
 34 - item.url.startsWith("https://") && isDate(item.eventDate
-) && isDate(item.accessDate)  
 35 - );  
 36 - if (record.decision === "included" && !investmentEvidence) - {  
 37 - errors.push(where + " is included but lacks dated HTTPS
-evidence of a direct investment.");  
 74 + for (const [evidenceIndex, item] of record.evidence.entrie
+s()) {  
 75 + const evidenceWhere = where + ".evidence[" + evidenceInd
+ex + "]";  
 76 + if (!item || typeof item !== "object") {  
 77 + errors.push(evidenceWhere + " must be an object.");  
 78 + continue;  
 79 + }  
 80 + if (!isText(item.claim)) errors.push(evidenceWhere + ".c
+laim is required.");  
 81 + if (!isHttps(item.url)) errors.push(evidenceWhere + ".ur
+l must be an HTTPS URL.");  
 82 + if (!isDate(item.accessDate)) errors.push(evidenceWhere
++ ".accessDate must use YYYY-MM-DD.");  
 83 + if (item.eventDate != null && !isDate(item.eventDate)) e
+rrors.push(evidenceWhere + ".eventDate must use YYYY-MM-DD or
+null.");  
 84 + if (item.publishedDate != null && !isDate(item.published
+Date)) errors.push(evidenceWhere + ".publishedDate must use YY
+YY-MM-DD or null.");  
 85 + if (!isText(item.title)) errors.push(evidenceWhere + ".t
+itle is required.");  
 86 + if (!isText(item.publisher)) errors.push(evidenceWhere + + ".publisher is required.");  
 87 + if (!isText(item.excerpt)) errors.push(evidenceWhere + "
+.excerpt is required.");  
 88 + if (datasetDateValid && isDate(item.eventDate) && item.e
+ventDate > dataset.datasetDate) {  
 89 + errors.push(evidenceWhere + ".eventDate is after datas
+etDate.");  
 90 + }  
 91 }
92  
 40 - for (const [evidenceIndex, item] of record.evidence.entrie
-s()) {  
 93 + const investments = record.evidence.filter(isDatedInvestme
+nt)  
 94 + .filter((item) => !datasetDateValid || item.eventDate <= + dataset.datasetDate);  
 95 +  
 96 + if (record.decision === "included") {  
 97 + if (!investments.length) {  
 98 + errors.push(where + " is included but lacks dated HTTP
+S evidence of a direct investment with a publisher.");  
 99 + }  
 100 + const office = record.operatingOffice;  
 101 + if (!office || typeof office !== "object" || !CZECH_COUN
+TRIES.has(office.country)) {  
 102 + errors.push(where + " is included but operatingOffice.
+country is not the Czech Republic.");  
 103 + }  
 104 + const officeEvidence = record.evidence.some((item) =>  
 105 + item && item.claim === "operating_office" && isHttps(i
+tem.url) && isText(item.publisher) && isDate(item.accessDate)
106 + );  
 107 + if (!officeEvidence) {  
 108 + errors.push(where + " is included but lacks operating*
+office evidence with a publisher (a registered office does not + count).");  
 109 + }  
 110 + }  
 111 +  
 112 + if (record.activityStatus === "active" && datasetDateValid
+) {  
 113 + const windowStart = activeWindowStart(dataset.datasetDat
+e);  
 114 + if (!investments.some((item) => item.eventDate >= window
+Start)) {  
 115 + errors.push(where + " is labelled active but has no di
+rect investment dated between " + windowStart + " and " + data
+set.datasetDate + ".");  
 116 + }  
 117 + }  
 118 + }  
 119 + return errors;  
 120 +}  
 121 +  
 122 +export function validateCandidates(data) {  
 123 + const errors = [];  
 124 + if (!data || typeof data !== "object" || !Array.isArray(data
+.candidates)) {  
 125 + return ["Candidate file must be an object with a candidate
+s array."];  
 126 + }  
 127 + if (!isDate(data.discoveryDate)) errors.push("discoveryDate
+must use YYYY-MM-DD.");  
 128 +  
 129 + const ids = new Set();  
 130 + for (const [index, candidate] of data.candidates.entries())
+{  
 131 + const where = "candidates[" + index + "]";  
 132 + if (!candidate || typeof candidate !== "object") {  
 133 + errors.push(where + " must be an object.");  
 134 + continue;  
 135 + }  
 136 + if (!isText(candidate.id)) errors.push(where + ".id is req
+uired.");  
 137 + else if (ids.has(candidate.id)) errors.push(where + ".id d
+uplicates " + candidate.id + ".");  
 138 + else ids.add(candidate.id);  
 139 + if (!isText(candidate.name)) errors.push(where + ".name is + required.");  
 140 + if (!CANDIDATE_STATUSES.has(candidate.status)) errors.push
+(where + ".status must be candidate.");  
 141 + if (!CANDIDATE_DECISIONS.has(candidate.decision)) {  
 142 + errors.push(where + ".decision must be one of: " + [...C
+ANDIDATE_DECISIONS].join(", ") + ".");  
 143 + }  
 144 + if (!Array.isArray(candidate.evidence)) {  
 145 + errors.push(where + ".evidence must be an array.");  
 146 + continue;  
 147 + }  
 148 +  
 149 + for (const [evidenceIndex, item] of candidate.evidence.ent
+ries()) {  
 150 const evidenceWhere = where + ".evidence[" + evidenceInd
ex + "]";
151 if (!item || typeof item !== "object") {
152 errors.push(evidenceWhere + " must be an object.");
153 continue;
154 }
46 - if (typeof item.claim !== "string" || !item.claim.trim()
-) errors.push(evidenceWhere + ".claim is required.");  
 47 - if (typeof item.url !== "string" || !item.url.startsWith
-("https://")) errors.push(evidenceWhere + ".url must be an HTT
-PS URL.");  
 155 + if (!isText(item.claim)) errors.push(evidenceWhere + ".c
+laim is required.");  
 156 + if (!isText(item.sourceTitle)) errors.push(evidenceWhere + + ".sourceTitle is required.");  
 157 + if (!isText(item.publisher)) errors.push(evidenceWhere + + ".publisher is required.");  
 158 + if (!isHttps(item.url)) errors.push(evidenceWhere + ".ur
+l must be an HTTPS URL.");  
 159 if (!isDate(item.accessDate)) errors.push(evidenceWhere + ".accessDate must use YYYY-MM-DD.");
160 if (item.eventDate != null && !isDate(item.eventDate)) e
rrors.push(evidenceWhere + ".eventDate must use YYYY-MM-DD or
null.");
161 if (item.publishedDate != null && !isDate(item.published
Date)) errors.push(evidenceWhere + ".publishedDate must use YY
YY-MM-DD or null.");
51 - if (typeof item.title !== "string" || !item.title.trim()
-) errors.push(evidenceWhere + ".title is required.");  
 52 - if (typeof item.excerpt !== "string" || !item.excerpt.tr
-im()) errors.push(evidenceWhere + ".excerpt is required.");  
 162 + if (!isText(item.excerpt)) errors.push(evidenceWhere + "
+.excerpt is required.");  
 163 + if (item.manualVerification != null) {  
 164 + const review = item.manualVerification;  
 165 + if (typeof review !== "object" || !isText(review.revie
+wer) || !isDate(review.date) || !isText(review.method)) {  
 166 + errors.push(evidenceWhere + ".manualVerification nee
+ds reviewer, date (YYYY-MM-DD), and method.");  
 167 + }  
 168 + }  
 169 }
170 }
171 return errors;

● Write(src\cli.js)
⎿  Added 13 lines, removed 8 lines
1 import { readFile } from "node:fs/promises";
2 -import { validateDataset } from "./validate.js";  
 2 +import { validateDataset, validateCandidates } from "./validate
+.js";  
 3 import { evaluateIncluded } from "./evaluate.js";
4  
 5 async function readJson(path) {
6 return JSON.parse(await readFile(new URL(path, import.meta.ur
l), "utf8"));
7 }
8  
 9 -const command = process.argv[2];  
 10 -const dataset = await readJson("../data/investors.json");  
 11 -  
 12 -if (command === "validate") {  
 13 - const errors = validateDataset(dataset);  
 9 +function report(label, errors, count) {  
 10 if (errors.length) {
15 - console.error("Validation failed (" + errors.length + " iss
-ue(s)):");  
 11 + console.error(label + " validation failed (" + errors.lengt
+h + " issue(s)):");  
 12 for (const error of errors) console.error("- " + error);
13 process.exitCode = 1;
14 } else {
19 - console.log("Dataset valid: " + dataset.records.length + "
-record(s).");  
 15 + console.log(label + " valid: " + count + " record(s).");  
 16 }
17 +}  
 18 +  
 19 +const command = process.argv[2];  
 20 +const dataset = await readJson("../data/investors.json");  
 21 +  
 22 +if (command === "validate") {  
 23 + const candidates = await readJson("../data/candidates.json");
24 + report("Candidates (data/candidates.json)", validateCandidate
+s(candidates), candidates.candidates?.length ?? 0);  
 25 + report("Investors (data/investors.json)", validateDataset(dat
+aset), dataset.records?.length ?? 0);  
 26 } else if (command === "evaluate") {
27 const reviewData = await readJson("../data/reviews.json");
28 const result = evaluateIncluded(dataset.records, reviewData.r
eviews);

● Now the tests, using only fictional example records.

● Write(tests\validate.test.js)
⎿  Added 113 lines, removed 15 lines
1 import test from "node:test";
2 import assert from "node:assert/strict";
3 -import { validateDataset } from "../src/validate.js";  
 3 +import { validateDataset, activeWindowStart } from "../src/val
+idate.js";  
 4  
 5 +const investment = {  
 6 + claim: "direct_investment",  
 7 + url: "https://example.org/news/investment",  
 8 + title: "Investment announcement",  
 9 + publisher: "Example Company (investment recipient)",  
 10 + eventDate: "2025-04-10",  
 11 + publishedDate: "2025-04-10",  
 12 + accessDate: "2026-10-22",  
 13 + excerpt: "Sample VC invested in Example Company."  
 14 +};  
 15 +  
 16 +const office = {  
 17 + claim: "operating_office",  
 18 + url: "https://example.org/contact",  
 19 + title: "Contact",  
 20 + publisher: "Sample VC",  
 21 + eventDate: null,  
 22 + publishedDate: null,  
 23 + accessDate: "2026-10-22",  
 24 + excerpt: "Our team works from Prague."  
 25 +};  
 26 +  
 27 const validIncluded = {
28 id: "sample-vc",
29 name: "Sample VC",
30 decision: "included",
9 - evidence: [{
10 - claim: "direct_investment",
11 - url: "https://example.org/news/investment",
12 - title: "Investment announcement",
13 - eventDate: "2025-04-10",
14 - publishedDate: "2025-04-10",
15 - accessDate: "2026-10-22",
16 - excerpt: "Sample VC invested in Example Company."
17 - }]  
 31 + activityStatus: "active",  
 32 + operatingOffice: { city: "Prague", country: "Czech Republic" + },  
 33 + evidence: [investment, office]  
 34 };
35  
 20 -test("accepts an included record with dated direct-investment
-evidence", () => {  
 21 - assert.deepEqual(validateDataset({ datasetDate: "2026-10-22"
-, records: [validIncluded] }), []);  
 36 +function check(record, datasetDate = "2026-10-22") {  
 37 + return validateDataset({ datasetDate, records: [record] });
38 +}  
 39 +  
 40 +test("accepts an included record with dated investment and ope
+rating-office evidence", () => {  
 41 + assert.deepEqual(check(validIncluded), []);  
 42 });
43  
 44 test("rejects an included record without dated investment evid
ence", () => {
25 - const record = { ...validIncluded, evidence: [] };  
 26 - assert.ok(validateDataset({ datasetDate: "2026-10-22", recor
-ds: [record] }).some((error) => error.includes("lacks dated"))
-);  
 45 + const record = { ...validIncluded, activityStatus: null, evi
+dence: [office] };  
 46 + assert.ok(check(record).some((error) => error.includes("lack
+s dated")));  
 47 });
48  
 49 +test("rejects investment evidence without an event date", () =
+> {  
 50 + const record = { ...validIncluded, activityStatus: null, evi
+dence: [{ ...investment, eventDate: null }, office] };  
 51 + assert.ok(check(record).some((error) => error.includes("lack
+s dated")));  
 52 +});  
 53 +  
 54 +test("rejects evidence without a publisher", () => {  
 55 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, publisher: " " }, office] };  
 56 + const errors = check(record);  
 57 + assert.ok(errors.some((error) => error.includes(".publisher
+is required")));  
 58 + assert.ok(errors.some((error) => error.includes("lacks dated
+")));  
 59 +});  
 60 +  
 61 +test("rejects an included record without operating-office evid
+ence", () => {  
 62 + const record = { ...validIncluded, evidence: [investment] };
63 + assert.ok(check(record).some((error) => error.includes("lack
+s operating_office evidence")));  
 64 +});  
 65 +  
 66 +test("a registered office does not satisfy the operating-offic
+e requirement", () => {  
 67 + const registered = { ...office, claim: "registered_office",
+excerpt: "Registered office: Brno." };  
 68 + const record = { ...validIncluded, registeredOffice: { city: + "Brno", country: "Czech Republic" }, evidence: [investment, r
+egistered] };  
 69 + assert.ok(check(record).some((error) => error.includes("lack
+s operating_office evidence")));  
 70 +});  
 71 +  
 72 +test("rejects an included record whose operating office is out
+side the Czech Republic", () => {  
 73 + const record = { ...validIncluded, operatingOffice: { city:
+"Vienna", country: "Austria" } };  
 74 + assert.ok(check(record).some((error) => error.includes("oper
+atingOffice.country")));  
 75 +});  
 76 +  
 77 +test("needs_review records do not require complete evidence",
+() => {  
 78 + const record = { id: "x", name: "Borderline VC", decision: "
+needs_review", evidence: [] };  
 79 + assert.deepEqual(check(record), []);  
 80 +});  
 81 +  
 82 test("rejects duplicate IDs", () => {
83 const second = { ...validIncluded, name: "Another name" };
31 - assert.ok(validateDataset({ datasetDate: "2026-10-22", recor
-ds: [validIncluded, second] }).some((error) => error.includes(
-"duplicates")));  
 84 + const errors = validateDataset({ datasetDate: "2026-10-22",
+records: [validIncluded, second] });  
 85 + assert.ok(errors.some((error) => error.includes("duplicates"
+)));  
 86 });
87 +  
 88 +test("rejects impossible calendar dates", () => {  
 89 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, publishedDate: "2025-02-31" }, office] };  
 90 + assert.ok(check(record).some((error) => error.includes("publ
+ishedDate")));  
 91 +});  
 92 +  
 93 +test("active window is calculated from datasetDate", () => {  
 94 + assert.equal(activeWindowStart("2026-10-22"), "2023-10-22");
95 + assert.equal(activeWindowStart("2027-02-28"), "2024-02-28");
96 + assert.equal(activeWindowStart("2028-02-29"), "2025-02-28");
97 +});  
 98 +  
 99 +test("active label accepts an investment on the first day of t
+he window", () => {  
 100 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, eventDate: "2023-10-22" }, office] };  
 101 + assert.deepEqual(check(record), []);  
 102 +});  
 103 +  
 104 +test("active label rejects an investment older than 36 months
+before datasetDate", () => {  
 105 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, eventDate: "2023-10-21" }, office] };  
 106 + assert.ok(check(record).some((error) => error.includes("labe
+lled active")));  
 107 +});  
 108 +  
 109 +test("the same record passes or fails the active check dependi
+ng only on datasetDate", () => {  
 110 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, eventDate: "2022-06-01" }, office] };  
 111 + assert.deepEqual(check(record, "2025-01-01"), []);  
 112 + assert.ok(check(record, "2026-10-22").some((error) => error.
+includes("labelled active")));  
 113 +});  
 114 +  
 115 +test("an old investment is allowed when the record is labelled + historical", () => {  
 116 + const record = { ...validIncluded, activityStatus: "historic
+al", evidence: [{ ...investment, eventDate: "2020-01-15" }, of
+fice] };  
 117 + assert.deepEqual(check(record), []);  
 118 +});  
 119 +  
 120 +test("rejects an investment event dated after datasetDate", () + => {  
 121 + const record = { ...validIncluded, evidence: [{ ...investmen
+t, eventDate: "2026-11-01" }, office] };  
 122 + const errors = check(record);  
 123 + assert.ok(errors.some((error) => error.includes("after datas
+etDate")));  
 124 + assert.ok(errors.some((error) => error.includes("lacks dated
+")));  
 125 +});  
 126 +  
 127 +test("rejects an unknown activityStatus", () => {  
 128 + const record = { ...validIncluded, activityStatus: "dormant" + };  
 129 + assert.ok(check(record).some((error) => error.includes("acti
+vityStatus")));  
 130 +});

● Write(tests\candidates.test.js)
⎿  Wrote 63 lines to tests\candidates.test.js
1 import test from "node:test";
2 import assert from "node:assert/strict";
3 import { readFile } from "node:fs/promises";
4 import { validateCandidates } from "../src/validate.js";
5
6 const evidence = {
7 claim: "direct_investment",
8 sourceTitle: "Example Company raises a seed round",
9 publisher: "Example Company (investment recipient)",
10 url: "https://example.org/news/seed",
… +66 lines (ctrl+o to expand)

Ran 1 shell command (ctrl+o to expand)

● Updating the one README line that lists which files the commands read:

● Update(README.md)
⎿  Added 1 line, removed 1 line
24 npm run validate
25 npm run evaluate
26  
 27 -The commands read data/investors.json and data/reviews.json. Th
-e current files are intentionally empty until records and human - review are ready.  
 27 +`npm run validate` checks data/candidates.json against the cand
+idate schema and data/investors.json against the stricter final + investor schema. `npm run evaluate` reads data/investors.json
+and data/reviews.json. The investor and review files are intent
+ionally empty until records and human review are ready.  
 28  
 29 ## Data and evidence
30

● I've applied the update. npm test passes all 26 tests, and npm run validate
passes for both files: 3 candidates in data/candidates.json and 0 records in
data/investors.json. Nothing is committed, no data records were changed, no
inclusion decisions or review labels were added, and I didn't search the web.

What changed

docs/plan.md

- The unit of record is the VC manager. Its funds and vehicles are linked to
  it and not counted as separate investors.
- Czech geography is decided by the principal operating office. A registered
  office is stored separately, and a registered address alone leaves the case
  needs_review for geography.
- Corporate and state-backed VC vehicles qualify only with direct equity or
  quasi-equity investments. Accelerators qualify only if they invest directly;
  grant-only programs don't.
- Borderline or poorly documented cases stay needs_review.
- The active label needs a completed direct investment dated within 36 months
  before datasetDate.
- A publication date the source doesn't support is recorded as null, and no
  date is flagged as suspicious without a source showing it is wrong.

src/validate.js

- Final investor records now have stricter checks:
  - Every evidence item needs a publisher.
  - An included record needs:
    - a dated direct_investment with a publisher;
    - operating_office evidence with a publisher (registered_office evidence
      doesn't count);
    - operatingOffice.country set to the Czech Republic.
  - activityStatus: "active" needs an investment dated between the window
    start and datasetDate. The window is counted from datasetDate, never from
    today's date.
  - Investment dates after datasetDate are rejected.
  - Impossible calendar dates (e.g. Feb 31) are rejected.
- Candidates get a separate validateCandidates check:
  - allowed status and decision values;
  - required source fields (claim, sourceTitle, publisher, an HTTPS url,
    accessDate, excerpt);
  - dates that are either null or valid;
  - any manualVerification note must include reviewer, date and method.

Other files

- src/cli.js: validate now checks both files.
- tests/validate.test.js: rewritten for the stricter rules.
- tests/candidates.test.js: new. It also checks that the real
  data/candidates.json passes.
- README.md: updated the line saying which files the commands read.

All test records are fictional (example.org).

Remaining limitations

- I chose the allowed candidate decisions myself:
  pending_profile_and_manual_review, pending_manual_review, needs_review and
  out_of_scope. Change them if you'd prefer a different set.
- The investor-type rules are documented but not enforced in code. That covers
  corporate and state-backed VC, accelerators, and grant-only programs; they
  are human judgements.
- The current candidates use different office claim names (main_office,
  main_office_and_legal_identity, …). Moving a candidate into the final schema
  will mean deciding by hand whether that evidence shows an operating or a
  registered office. Purple's evidence currently shows only a registered
  office.
- I didn't change the existing dates in the candidate data, because nothing in
  the project shows any of them is wrong. One date has no manual check
  recorded: the 2023-01-01 date on Purple's privacy policy. If you can't
  confirm it from the page, set it to null.
- Still not done from the audit:
  - The status paragraphs in docs/plan.md and docs/evaluation.md still don't
    match the manual checks recorded in the data.
  - There is no funds field for linking funds to their manager yet.
  - The fields in reviews.json and the evaluation code are unchanged.

> Continue with the evaluation design. Do not search the web or change any
> investor or candidate records.

Design and implement a clear way to keep preliminary predictions separate
from human review labels for the frozen candidate list.

Use preliminary decisions: included, excluded, needs_review.
Use human labels: eligible, not_eligible, unresolved.
Store reviewer, review date, reason, and reviewed source URLs for human
labels.

Calculate:

- TP, FP, TN, FN for manually reviewed included/excluded predictions;
- precision = TP / (TP + FP);
- a conservative precision that counts unresolved included predictions as
  failures;
- recall only against the frozen candidate list, and clearly label it as
  sample recall.

Keep needs_review and unresolved cases separate from binary counts. Never
create human labels automatically. If there are no eligible predictions or no
human reviews, report the metric as unavailable, not as 0%.

Align the status text in docs/plan.md and docs/evaluation.md with the actual
files. Add tests using fictional data only. Do not add real investor records
or review labels.

Run npm test, npm run validate, npm run evaluate, and git diff --check.
Summarize the files changed and results. Do not commit.

● I'll check the current docs before editing them.

Ran 1 shell command (ctrl+o to expand)

● Now the evaluation module. Predictions stay in data/investors.json (each
record's decision, linked by candidateId). Human labels go only in
data/reviews.json.

● Write(src\evaluate.js) ⎿  Added 107 lines, removed 32 lines
1 -const LABELS = new Set(["confirmed", "rejected", "unresolved"]
-);  
 1 +import { createHash } from "node:crypto";  
 2  
 3 -export function evaluateIncluded(records, reviews) {  
 4 - const included = records.filter((record) => record.decision
-=== "included");  
 5 - const reviewById = new Map(reviews.map((review) => [review.i
-d, review]));  
 6 - let tp = 0;  
 7 - let fp = 0;  
 8 - let unresolved = 0;  
 9 - const missingReview = [];  
 10 - const invalidReview = [];  
 3 +export const PREDICTIONS = new Set(["included", "excluded", "n
+eeds_review"]);  
 4 +export const LABELS = new Set(["eligible", "not_eligible", "un
+resolved"]);  
 5  
 12 - for (const record of included) {  
 13 - const review = reviewById.get(record.id);  
 14 - if (!review) {  
 15 - missingReview.push(record.id);  
 16 - continue;  
 6 +const SAMPLE_RECALL_SCOPE = "Sample recall: measured only agai
+nst the frozen candidate list, not against all investors in th
+e market.";  
 7 +  
 8 +// Fingerprint of parsed JSON, so Git line-ending conversion d
+oes not change it.  
 9 +export function fingerprint(value) {  
 10 + return createHash("sha256").update(JSON.stringify(value)).di
+gest("hex");  
 11 +}  
 12 +  
 13 +function metric(numerator, denominator, unavailableReason) {  
 14 + if (!denominator) return { status: "unavailable", value: nul
+l, numerator, denominator, reason: unavailableReason };  
 15 + return { status: "available", value: numerator / denominator
+, numerator, denominator };  
 16 +}  
 17 +  
 18 +function freezeCheck(expected, actual) {  
 19 + if (expected == null) return "not_frozen";  
 20 + return expected === actual ? "matches" : "changed_since_free
+ze";  
 21 +}  
 22 +  
 23 +// Joins the frozen candidate list, preliminary predictions, a
+nd human labels.  
 24 +// Human labels are only read here; this module never creates
+them.  
 25 +export function evaluate({ candidates, records, reviews, freez
+e = {} }) {  
 26 + const issues = [];  
 27 + const frameIds = new Set(candidates.map((candidate) => candi
+date.id));  
 28 +  
 29 + const predictionByCandidate = new Map();  
 30 + for (const record of records) {  
 31 + const label = "Prediction " + (record.id ?? "(no id)");  
 32 + if (typeof record.candidateId !== "string") issues.push(la
+bel + " has no candidateId.");  
 33 + else if (!frameIds.has(record.candidateId)) issues.push(la
+bel + " refers to " + record.candidateId + ", which is not in
+the frozen candidate list.");  
 34 + else if (predictionByCandidate.has(record.candidateId)) is
+sues.push(label + " duplicates the prediction for " + record.c
+andidateId + ".");  
 35 + else if (!PREDICTIONS.has(record.decision)) issues.push(la
+bel + " has an invalid decision.");  
 36 + else predictionByCandidate.set(record.candidateId, record.
+decision);  
 37 + }  
 38 +  
 39 + const labelByCandidate = new Map();  
 40 + for (const review of reviews) {  
 41 + const label = "Review for " + (review.candidateId ?? "(no
+candidateId)");  
 42 + if (!frameIds.has(review.candidateId)) issues.push(label + + " is not in the frozen candidate list.");  
 43 + else if (labelByCandidate.has(review.candidateId)) issues.
+push(label + " is duplicated.");  
 44 + else if (!LABELS.has(review.label)) issues.push(label + "
+has an invalid label.");  
 45 + else labelByCandidate.set(review.candidateId, review.label
+);  
 46 + }  
 47 +  
 48 + const binary = { tp: [], fp: [], tn: [], fn: [] };  
 49 + const separate = {  
 50 + withoutPrediction: [],  
 51 + unreviewedIncluded: [],  
 52 + unreviewedExcluded: [],  
 53 + unresolvedIncluded: [],  
 54 + unresolvedExcluded: [],  
 55 + needsReview: { eligible: [], not_eligible: [], unresolved: + [], unreviewed: [] }  
 56 + };  
 57 +  
 58 + for (const { id } of candidates) {  
 59 + const prediction = predictionByCandidate.get(id);  
 60 + const label = labelByCandidate.get(id);  
 61 + if (!prediction) {  
 62 + separate.withoutPrediction.push(id);  
 63 + } else if (prediction === "needs_review") {  
 64 + separate.needsReview[label ?? "unreviewed"].push(id);  
 65 + } else if (!label) {  
 66 + (prediction === "included" ? separate.unreviewedIncluded + : separate.unreviewedExcluded).push(id);  
 67 + } else if (label === "unresolved") {  
 68 + (prediction === "included" ? separate.unresolvedIncluded + : separate.unresolvedExcluded).push(id);  
 69 + } else if (prediction === "included") {  
 70 + (label === "eligible" ? binary.tp : binary.fp).push(id);
71 + } else {  
 72 + (label === "eligible" ? binary.fn : binary.tn).push(id);
73 }
18 - if (!LABELS.has(review.label)) {  
 19 - invalidReview.push(record.id);  
 20 - continue;  
 21 - }  
 22 - if (review.label === "confirmed") tp += 1;  
 23 - if (review.label === "rejected") fp += 1;  
 24 - if (review.label === "unresolved") unresolved += 1;  
 74 }
75  
 27 - const reviewed = tp + fp + unresolved;  
 28 - const precisionDenominator = tp + fp;  
 76 + const tp = binary.tp.length;  
 77 + const fp = binary.fp.length;  
 78 + const fn = binary.fn.length;  
 79 + const unresolvedIncluded = separate.unresolvedIncluded.lengt
+h;  
 80 +  
 81 + const freezeStatus = {  
 82 + candidates: freezeCheck(freeze.candidatesFingerprint, fing
+erprint(candidates)),  
 83 + predictions: freezeCheck(freeze.predictionsFingerprint, fi
+ngerprint(records))  
 84 + };  
 85 + for (const [name, status] of Object.entries(freezeStatus)) {
86 + if (status === "changed_since_freeze") issues.push("The "
++ name + " changed after the recorded freeze; metrics do not d
+escribe the frozen version.");  
 87 + }  
 88 +  
 89 return {
30 - includedCount: included.length,  
 31 - reviewedCount: reviewed,  
 32 - tp,  
 33 - fp,  
 34 - unresolved,  
 35 - missingReview,  
 36 - invalidReview,  
 37 - precision: precisionDenominator ? tp / precisionDenominato
-r : null,  
 38 - conservativeLowerEstimate: reviewed ? tp / (tp + fp + unre
-solved) : null  
 90 + frame: {  
 91 + candidateCount: candidates.length,  
 92 + predictionCount: predictionByCandidate.size,  
 93 + humanLabelCount: labelByCandidate.size,  
 94 + freezeStatus  
 95 + },  
 96 + counts: { tp, fp, tn: binary.tn.length, fn },  
 97 + ids: binary,  
 98 + separate,  
 99 + metrics: {  
 100 + precision: metric(tp, tp + fp,  
 101 + "No included prediction has a binary human label (elig
+ible or not_eligible)."),  
 102 + conservativePrecision: {  
 103 + ...metric(tp, tp + fp + unresolvedIncluded,  
 104 + "No included prediction has a human label."),  
 105 + note: "Counts unresolved included predictions as failu
+res."  
 106 + },  
 107 + sampleRecall: {  
 108 + ...metric(tp, tp + fn,  
 109 + "No included or excluded prediction has a human labe
+l of eligible."),  
 110 + note: SAMPLE_RECALL_SCOPE  
 111 + }  
 112 + },  
 113 + issues  
 114 };
115 }

● Next, review-file validation and the candidateId link in src/validate.js:

● Update(src\validate.js)
⎿  Added 1 line
62 else if (ids.has(record.id)) errors.push(where + ".id dupli
cates " + record.id + ".");
63 else ids.add(record.id);
64 if (!isText(record.name)) errors.push(where + ".name is req
uired.");
65 + if (record.candidateId != null && !isText(record.candidateI
+d)) errors.push(where + ".candidateId must be a non-empty strin
+g.");  
 66 if (!DECISIONS.has(record.decision)) errors.push(where + ".
decision must be included, excluded, or needs_review.");
67 if (record.activityStatus != null && !ACTIVITY_STATUSES.has
(record.activityStatus)) {
68 errors.push(where + ".activityStatus must be active, hist
orical, needs_review, or null.");

● Update(src\validate.js)
⎿  Added 44 lines
120 return errors;
121 }
122  
 123 +const REVIEW_LABELS = new Set(["eligible", "not_eligible", "un
+resolved"]);  
 124 +const FINGERPRINT = /^[0-9a-f]{64}$/;  
 125 +  
 126 +// Human review labels are entered by a person; this only chec
+ks their structure.  
 127 +export function validateReviews(data, candidateIds) {  
 128 + const errors = [];  
 129 + if (!data || typeof data !== "object" || !Array.isArray(data
+.reviews)) {  
 130 + return ["Review file must be an object with a reviews arra
+y."];  
 131 + }  
 132 + if (!isDate(data.datasetDate)) errors.push("datasetDate must + use YYYY-MM-DD.");  
 133 +  
 134 + const freeze = data.freeze;  
 135 + if (freeze != null) {  
 136 + if (typeof freeze !== "object") errors.push("freeze must b
+e an object or null.");  
 137 + else {  
 138 + if (freeze.frozenOn != null && !isDate(freeze.frozenOn)) + errors.push("freeze.frozenOn must use YYYY-MM-DD or null.");
139 + for (const key of ["candidatesFingerprint", "predictions
+Fingerprint"]) {  
 140 + if (freeze[key] != null && !FINGERPRINT.test(freeze[ke
+y])) errors.push("freeze." + key + " must be a SHA-256 hex str
+ing or null.");  
 141 + }  
 142 + }  
 143 + }  
 144 +  
 145 + const seen = new Set();  
 146 + for (const [index, review] of data.reviews.entries()) {  
 147 + const where = "reviews[" + index + "]";  
 148 + if (!review || typeof review !== "object") {  
 149 + errors.push(where + " must be an object.");  
 150 + continue;  
 151 + }  
 152 + if (!isText(review.candidateId)) errors.push(where + ".can
+didateId is required.");  
 153 + else if (!candidateIds.has(review.candidateId)) errors.pus
+h(where + ".candidateId " + review.candidateId + " is not in t
+he frozen candidate list.");  
 154 + else if (seen.has(review.candidateId)) errors.push(where + + ".candidateId duplicates " + review.candidateId + ".");  
 155 + else seen.add(review.candidateId);  
 156 + if (!REVIEW_LABELS.has(review.label)) errors.push(where +
+".label must be eligible, not_eligible, or unresolved.");  
 157 + if (!isText(review.reviewer)) errors.push(where + ".review
+er is required.");  
 158 + if (!isDate(review.reviewDate)) errors.push(where + ".revi
+ewDate must use YYYY-MM-DD.");  
 159 + if (!isText(review.reason)) errors.push(where + ".reason i
+s required.");  
 160 + if (!Array.isArray(review.sourceUrls) || !review.sourceUrl
+s.length || !review.sourceUrls.every(isHttps)) {  
 161 + errors.push(where + ".sourceUrls must be a non-empty arr
+ay of HTTPS URLs.");  
 162 + }  
 163 + }  
 164 + return errors;  
 165 +}  
 166 +  
 167 export function validateCandidates(data) {
168 const errors = [];
169 if (!data || typeof data !== "object" || !Array.isArray(data
.candidates)) {

● Write(src\cli.js)
⎿  Added 27 lines, removed 9 lines
1 import { readFile } from "node:fs/promises";
2 -import { validateDataset, validateCandidates } from "./validate.
-js";  
 3 -import { evaluateIncluded } from "./evaluate.js";  
 2 +import { validateDataset, validateCandidates, validateReviews }
+from "./validate.js";  
 3 +import { evaluate, fingerprint } from "./evaluate.js";  
 4  
 5 async function readJson(path) {
6 return JSON.parse(await readFile(new URL(path, import.meta.url
), "utf8"));
...
17 }
18  
 19 const command = process.argv[2];
20 +const candidateData = await readJson("../data/candidates.json")
+;  
 21 const dataset = await readJson("../data/investors.json");
22 +const reviewData = await readJson("../data/reviews.json");  
 23 +const candidateIds = new Set((candidateData.candidates ?? []).m
+ap((candidate) => candidate.id));  
 24  
 25 if (command === "validate") {
23 - const candidates = await readJson("../data/candidates.json");
24 - report("Candidates (data/candidates.json)", validateCandidate
-s(candidates), candidates.candidates?.length ?? 0);  
 26 + report("Candidates (data/candidates.json)", validateCandidate
+s(candidateData), candidateData.candidates?.length ?? 0);  
 27 report("Investors (data/investors.json)", validateDataset(dat
aset), dataset.records?.length ?? 0);
28 + report("Human reviews (data/reviews.json)", validateReviews(r
+eviewData, candidateIds), reviewData.reviews?.length ?? 0);  
 29 } else if (command === "evaluate") {
27 - const reviewData = await readJson("../data/reviews.json");  
 28 - const result = evaluateIncluded(dataset.records, reviewData.r
-eviews);  
 29 - console.log(JSON.stringify(result, null, 2));  
 30 - if (result.missingReview.length || result.invalidReview.lengt
-h) process.exitCode = 1;  
 30 + const reviewErrors = validateReviews(reviewData, candidateIds
+);  
 31 + if (reviewErrors.length) {  
 32 + report("Human reviews (data/reviews.json)", reviewErrors, 0
+);  
 33 + } else {  
 34 + const result = evaluate({  
 35 + candidates: candidateData.candidates,  
 36 + records: dataset.records,  
 37 + reviews: reviewData.reviews,  
 38 + freeze: reviewData.freeze ?? {}  
 39 + });  
 40 + console.log(JSON.stringify(result, null, 2));  
 41 + if (result.issues.length) process.exitCode = 1;  
 42 + }  
 43 +} else if (command === "fingerprint") {  
 44 + // Prints values for a person to copy into data/reviews.json
+"freeze"; writes nothing.  
 45 + console.log(JSON.stringify({  
 46 + candidatesFingerprint: fingerprint(candidateData.candidates
+),  
 47 + predictionsFingerprint: fingerprint(dataset.records)  
 48 + }, null, 2));  
 49 } else {
32 - console.error("Usage: node src/cli.js <validate|evaluate>");
50 + console.error("Usage: node src/cli.js <validate|evaluate|fing
+erprint>");  
 51 process.exitCode = 2;
52 }

● Bash(cd "[LOCAL_WINDOWS_PATH_REDACTED]"
&& cat > data/reviews.json <<'EOF'
{…)
⎿  Updated data\reviews.json (+5 -0)
1 {
2 "datasetDate": "2026-10-22",
3 + "freeze": {  
 4 + "frozenOn": null,  
 5 + "candidatesFingerprint": null,  
 6 + "predictionsFingerprint": null  
 7 + },  
 8 "reviews": []
9 }
⎿  Updated package.json (+1 -0)
7 "scripts": {
8 "validate": "node src/cli.js validate",
9 "evaluate": "node src/cli.js evaluate",
10 + "fingerprint": "node src/cli.js fingerprint",  
 11 "test": "node --test"
12 },
13 "engines": {
⎿  (files that changed while this command ran, by the command or by
another process; a convenience view, not a review or audit of the
command)

● Now tests with fictional data only:

● Write(tests\evaluate.test.js)
⎿  Added 115 lines, removed 22 lines
1 import test from "node:test";
2 import assert from "node:assert/strict";
3 -import { evaluateIncluded } from "../src/evaluate.js";  
 3 +import { evaluate, fingerprint } from "../src/evaluate.js";  
 4  
 5 -test("calculates precision and conservative estimate from manu
-al labels", () => {  
 6 - const records = [
7 - { id: "a", decision: "included" },
8 - { id: "b", decision: "included" },
9 - { id: "c", decision: "included" }
10 - ];  
 11 - const reviews = [
12 - { id: "a", label: "confirmed" },
13 - { id: "b", label: "rejected" },
14 - { id: "c", label: "unresolved" }
15 - ];  
 16 - const result = evaluateIncluded(records, reviews);  
 17 - assert.equal(result.tp, 1);  
 18 - assert.equal(result.fp, 1);  
 19 - assert.equal(result.unresolved, 1);  
 20 - assert.equal(result.precision, 0.5);  
 21 - assert.equal(result.conservativeLowerEstimate, 1 / 3);  
 5 +// Fictional candidates, predictions, and labels only.  
 6 +const candidates = ["a", "b", "c", "d", "e", "f", "g", "h"].ma
+p((id) => ({ id, name: "Fictional " + id }));  
 7 +  
 8 +function prediction(candidateId, decision) {  
 9 + return { id: "rec-" + candidateId, candidateId, name: "Ficti
+onal " + candidateId, decision, evidence: [] };  
 10 +}  
 11 +  
 12 +function label(candidateId, value) {  
 13 + return { candidateId, label: value, reviewer: "test-reviewer
+", reviewDate: "2026-10-22", reason: "Fictional test label.",
+sourceUrls: ["https://example.org/" + candidateId] };  
 14 +}  
 15 +  
 16 +const records = [
17 + prediction("a", "included"),
18 + prediction("b", "included"),
19 + prediction("c", "included"),
20 + prediction("d", "excluded"),
21 + prediction("e", "excluded"),
22 + prediction("f", "needs_review"),
23 + prediction("g", "included")
24 +];  
 25 +  
 26 +const reviews = [
27 + label("a", "eligible"),
28 + label("b", "not_eligible"),
29 + label("c", "unresolved"),
30 + label("d", "not_eligible"),
31 + label("e", "eligible"),
32 + label("f", "eligible")
33 +];  
 34 +  
 35 +test("counts TP, FP, TN, FN only for binary-labelled included/
+excluded predictions", () => {  
 36 + const result = evaluate({ candidates, records, reviews });  
 37 + assert.deepEqual(result.counts, { tp: 1, fp: 1, tn: 1, fn: 1 + });  
 38 + assert.deepEqual(result.ids, { tp: ["a"], fp: ["b"], tn: ["d
+"], fn: ["e"] });  
 39 + assert.deepEqual(result.issues, []);  
 40 });
41  
 24 -test("reports missing manual reviews", () => {  
 25 - const result = evaluateIncluded([{ id: "a", decision: "inclu
-ded" }], []);  
 26 - assert.deepEqual(result.missingReview, ["a"]);  
 27 - assert.equal(result.precision, null);  
 42 +test("keeps needs_review, unresolved, unreviewed, and unpredic
+ted cases out of binary counts", () => {  
 43 + const { separate } = evaluate({ candidates, records, reviews + });  
 44 + assert.deepEqual(separate.unresolvedIncluded, ["c"]);  
 45 + assert.deepEqual(separate.unreviewedIncluded, ["g"]);  
 46 + assert.deepEqual(separate.needsReview.eligible, ["f"]);  
 47 + assert.deepEqual(separate.withoutPrediction, ["h"]);  
 48 });
49 +  
 50 +test("calculates precision, conservative precision, and sample + recall", () => {  
 51 + const { metrics } = evaluate({ candidates, records, reviews
+});  
 52 + assert.equal(metrics.precision.value, 0.5);  
 53 + assert.equal(metrics.precision.denominator, 2);  
 54 + assert.equal(metrics.conservativePrecision.value, 1 / 3);  
 55 + assert.equal(metrics.conservativePrecision.denominator, 3);
56 + assert.equal(metrics.sampleRecall.value, 0.5);  
 57 + assert.match(metrics.sampleRecall.note, /frozen candidate li
+st/);  
 58 +});  
 59 +  
 60 +test("reports metrics as unavailable, not 0, when there are no + human reviews", () => {  
 61 + const { metrics, frame } = evaluate({ candidates, records, r
+eviews: [] });  
 62 + assert.equal(frame.humanLabelCount, 0);  
 63 + for (const name of ["precision", "conservativePrecision", "s
+ampleRecall"]) {  
 64 + assert.equal(metrics[name].status, "unavailable");  
 65 + assert.equal(metrics[name].value, null);  
 66 + }  
 67 +});  
 68 +  
 69 +test("reports metrics as unavailable when there are no predict
+ions", () => {  
 70 + const { metrics, separate } = evaluate({ candidates, records
+: [], reviews: [label("a", "eligible")] });  
 71 + assert.equal(metrics.precision.status, "unavailable");  
 72 + assert.equal(metrics.sampleRecall.status, "unavailable");  
 73 + assert.equal(separate.withoutPrediction.length, candidates.l
+ength);  
 74 +});  
 75 +  
 76 +test("an all-false-positive result is 0, not unavailable", ()
+=> {  
 77 + const { metrics } = evaluate({ candidates, records: [predict
+ion("a", "included")], reviews: [label("a", "not_eligible")] }
+);  
 78 + assert.equal(metrics.precision.status, "available");  
 79 + assert.equal(metrics.precision.value, 0);  
 80 + assert.equal(metrics.sampleRecall.status, "unavailable");  
 81 +});  
 82 +  
 83 +test("only unresolved included predictions give unavailable pr
+ecision but 0 conservative precision", () => {  
 84 + const { metrics } = evaluate({ candidates, records: [predict
+ion("a", "included")], reviews: [label("a", "unresolved")] });
85 + assert.equal(metrics.precision.status, "unavailable");  
 86 + assert.equal(metrics.conservativePrecision.value, 0);  
 87 +});  
 88 +  
 89 +test("needs_review predictions labelled eligible do not count
+as false negatives", () => {  
 90 + const { counts, metrics } = evaluate({ candidates, records: +[prediction("f", "needs_review")], reviews: [label("f", "eligi
+ble")] });  
 91 + assert.equal(counts.fn, 0);  
 92 + assert.equal(metrics.sampleRecall.status, "unavailable");  
 93 +});  
 94 +  
 95 +test("reports predictions and reviews that cannot be joined to + the candidate list", () => {  
 96 + const { issues } = evaluate({  
 97 + candidates,  
 98 + records: [{ id: "x", decision: "included" }, prediction("z
+z", "included"), prediction("a", "included"), prediction("a",
+"excluded")],  
 99 + reviews: [label("zz", "eligible"), label("b", "maybe")]  
 100 + });  
 101 + assert.ok(issues.some((issue) => issue.includes("has no cand
+idateId")));  
 102 + assert.ok(issues.some((issue) => issue.includes("rec-zz refe
+rs to zz")));  
 103 + assert.ok(issues.some((issue) => issue.includes("duplicates
+the prediction")));  
 104 + assert.ok(issues.some((issue) => issue.includes("Review for
+zz")));  
 105 + assert.ok(issues.some((issue) => issue.includes("invalid lab
+el")));  
 106 +});  
 107 +  
 108 +test("freeze check detects predictions changed after the recor
+ded freeze", () => {  
 109 + const freeze = { candidatesFingerprint: fingerprint(candidat
+es), predictionsFingerprint: fingerprint(records) };  
 110 + assert.deepEqual(evaluate({ candidates, records, reviews, fr
+eeze }).frame.freezeStatus, { candidates: "matches", predictio
+ns: "matches" });  
 111 + const changed = evaluate({ candidates, records: records.slic
+e(1), reviews, freeze });  
 112 + assert.equal(changed.frame.freezeStatus.predictions, "change
+d_since_freeze");  
 113 + assert.ok(changed.issues.some((issue) => issue.includes("cha
+nged after the recorded freeze")));  
 114 +});  
 115 +  
 116 +test("does not create or modify human labels", () => {  
 117 + const input = reviews.map((review) => ({ ...review }));  
 118 + evaluate({ candidates, records, reviews: input });  
 119 + assert.deepEqual(input, reviews);  
 120 + assert.equal(evaluate({ candidates, records, reviews: [] }).
+frame.humanLabelCount, 0);  
 121 +});

● Write(tests\reviews.test.js)
⎿  Wrote 52 lines to tests\reviews.test.js
1 import test from "node:test";
2 import assert from "node:assert/strict";
3 import { validateReviews } from "../src/validate.js";
4
5 // Fictional review labels only.
6 const candidateIds = new Set(["candidate-a", "candidate-b"]);
7
8 const review = {
9 candidateId: "candidate-a",
10 label: "eligible",
… +54 lines (ctrl+o to expand)

Ran 1 shell command (ctrl+o to expand)

● Code works. Now aligning docs/plan.md and docs/evaluation.md with what the
files actually contain.

● Update(docs\plan.md)
⎿  Added 3 lines, removed 3 lines
58  
 59 ## Evaluation
60  
 61 -Freeze predictions before human review. The human review table
-is the reference label; a second AI pass is not independent man
-ual review.  
 61 +Freeze the candidate list and preliminary predictions before hu
+man review. Preliminary predictions (included, excluded, needs\_
+review) are stored in data/investors.json and linked to the fro
+zen list by `candidateId`. Human labels (eligible, not_eligible
+, unresolved) are stored only in data/reviews.json, with review
+er, review date, reason, and reviewed source URLs. Code never c
+reates human labels, and a second AI pass is not independent ma
+nual review. The full protocol and metric definitions are in do
+cs/evaluation.md.  
 62  
 63 -Primary metric: precision of included records = TP / (TP + FP), - where TP is a predicted inclusion confirmed by manual review a
-nd FP is a predicted inclusion rejected by manual review. Show
-counts and denominator. Report unresolved included cases U sepa
-rately and also show the conservative lower estimate TP / (TP + - FP + U).  
 63 +Primary metric: precision = TP / (TP + FP). Also report a conse
+rvative precision that counts unresolved included predictions a
+s failures, and sample recall measured only against the frozen
+candidate list, not against every investor in the market. needs
+\_review predictions and unresolved labels are reported separate
+ly from the binary counts. A metric with an empty denominator i
+s reported as unavailable, not 0%.  
 64  
 65 -Also report geography/type correctness, claim-level evidence co
-verage, dated investment-evidence coverage, field completeness, - disclosure rates for cheque/capital, conflicts, and errors. Re
-call may be reported only against the frozen candidate list, no
-t against every investor in the world.  
 65 +Also report geography/type correctness, claim-level evidence co
+verage, dated investment-evidence coverage, field completeness, + disclosure rates for cheque/capital, conflicts, and errors.  
 66  
 67 ## Global scope and cost estimate
68

● Update(docs\plan.md)
⎿  Added 12 lines, removed 1 line
80 - src/ and tests/: repeatable validation and metric calculation
. Candidate records (data/candidates.json) and final investor r
ecords (data/investors.json) use separate schemas and validator
s; candidates are not forced into the final schema.
81 - ai-log/: authentic AI conversation exports, with secrets remo
ved.
82  
 83 -Current status (2026-10-22): first-pass public profiles and dat
-ed investment evidence are collected for Credo Ventures, Tilia
-Impact Ventures, and Purple Ventures. The direct-investment evi
-dence is the same recipient announcement, so candidate discover
-y is not independent and the sample is not representative. The
-user has manually checked Credo's Prague address and its Stage
-V announcement; Tilia and Purple profile claims still require m
-anual review. No precision or global count is claimed. Next, br
-oaden discovery beyond investors in the Delta Green round, free
-ze the candidate list, manually label inclusions/exclusions/unr
-esolved cases, then calculate precision.  
 83 +Current status (2026-10-22):  
 84 +  
 85 +- data/candidates.json holds 3 candidates (Credo Ventures, Tili
+a Impact Ventures, Purple Ventures), all with decision `pending
         +_profile_and_manual_review`. All three were found through the s
+ame recipient announcement (Delta Green), so discovery is not i
+ndependent and the list is not representative. The list has not + yet been drawn from the planned discovery frames and is not fr
+ozen.  
 86 +- Source-level manual checks recorded in data/candidates.json ( +`manualVerification`):  
 87 + - Credo: direct investment, Prague office, and Fund V size ar
+e checked; the strategy/stage/ticket evidence is not.  
 88 + - Tilia: all five evidence items are checked.  
 89 + - Purple: direct investment, strategy, and Fund II launch tar
+get are checked; the registered-office/legal-identity evidence
+and the 2026 fundraising update are not.  
 90 + These are checks of individual sources, not human eligibility + labels.  
 91 +- data/investors.json has 0 preliminary predictions. data/revie
+ws.json has 0 human labels, and its freeze fingerprints are uns
+et.  
 92 +- No precision, recall, or global count is claimed. docs/global
+-estimate.md has not been started.  
 93 +  
 94 +Next: broaden discovery beyond investors in the Delta Green rou
+nd, freeze the candidate list, record preliminary predictions a
+nd their fingerprints, have a human label every candidate, then + run `npm run evaluate`.

● Write(docs\evaluation.md)
⎿  Added 62 lines, removed 9 lines
1 # Evaluation
2  
 3 -Status: not measured yet. The pilot candidate list and manual r
-eference labels must be frozen before reporting a result. The u
-ser has visually checked Credo Ventures' profile details and Ti
-lia Impact Ventures' ticket, stage, impact/geography criteria,
-maximum round-size distinction, and Prague contact address. Thi
-s is a partial source review, not yet a final inclusion label:
-direct-investment evidence and candidate identity/geography sti
-ll need to be reviewed consistently across the full frozen list
-.  
 3 +## Status (2026-10-22)  
 4  
 5 -For each candidate, a human reviewer will check identity, Czech - geography, investor type, direct completed investment evidence
-, and the relevant dates. Record confirmed, rejected, or unreso
-lved, plus the source and reason. Review all candidates in the
-pilot when feasible, including excluded and unresolved cases.  
 5 +Not measured. `npm run evaluate` currently reports every metric + as unavailable because:  
 6  
 7 -For predicted included records:  
 7 +- data/candidates.json has 3 candidates. The list is not frozen + and was not drawn from the planned discovery frames (see docs/
+plan.md).  
 8 +- data/investors.json has 0 preliminary predictions.  
 9 +- data/reviews.json has 0 human labels, and its freeze fingerpr
+ints are unset.  
 10  
 9 -- TP = confirmed by manual review  
 10 -- FP = rejected by manual review  
 11 -- U = unresolved  
 12 -- Precision = TP / (TP + FP)  
 13 -- Conservative lower estimate = TP / (TP + FP + U)  
 11 +The `manualVerification` notes in data/candidates.json record t
+hat the user checked individual sources. They are not human eli
+gibility labels and are not used by the evaluation.  
 12  
 15 -Publish counts as well as percentages. Do not count missing val
-ues as correct. Do not use an AI-only review as the human refer
-ence label. Any corrected dataset will be distinguished from th
-e frozen result used for evaluation.  
 13 +## Separating predictions from human labels  
 14 +  
 15 +| | Preliminary prediction | Human label |  
 16 +|---|---|---|  
 17 +| File | data/investors.json (`records[].decision`) | data/revi
+ews.json (`reviews[]`) |  
 18 +| Values | `included`, `excluded`, `needs_review` | `eligible`, + `not_eligible`, `unresolved` |  
 19 +| Link to frame | `candidateId` → data/candidates.json | `candi
         +dateId` → data/candidates.json |  
 20 +| Created by | Research workflow (may be AI-assisted) | A human + reviewer only; code never writes labels |  
 21 +  
 22 +Each human label records:  
 23 +  
 24 +`json                                                        
      25 +{                                                              
      26 +  "candidateId": "candidate-…",                                
      27 +  "label": "eligible | not_eligible | unresolved",             
      28 +  "reviewer": "name or initials",                              
      29 +  "reviewDate": "YYYY-MM-DD",                                  
      30 +  "reason": "why the candidate does or does not meet the inclus
         +ion rules",                                                    
      31 +  "sourceUrls": ["https://… sources the reviewer opened"]      
      32 +}                                                              
      33 +`  
 34 +  
 35 +`npm run validate` checks the structure of labels: allowed valu
+es, required fields, HTTPS source URLs, one label per candidate
+, and candidates that exist in the frozen list.  
 36 +  
 37 +## Freezing  
 38 +  
 39 +1. Finalize data/candidates.json (the frozen candidate list) an
+d the preliminary predictions in data/investors.json.  
 40 +2. Run `npm run fingerprint`. It prints fingerprints of the can
+didate list and the predictions and writes nothing.  
 41 +3. Copy them into `freeze` in data/reviews.json, with `frozenOn
         +`, and commit before any human labelling starts.  
 42 +4. `npm run evaluate` compares the current files with the finge
+rprints. If either has changed, it reports an issue and exits w
+ith an error, because the metrics would no longer describe the
+frozen version. Corrections made after review go into a separat
+ely labelled corrected dataset.  
 43 +  
 44 +## Human review protocol  
 45 +  
 46 +For each candidate in the frozen list, including predicted excl
+usions and needs_review cases, the reviewer opens the sources a
+nd checks identity, the Czech principal operating office, inves
+tor type, a completed direct investment, and the relevant dates + against the rules in docs/plan.md. The reviewer then records o
+ne label with a reason and the URLs they opened. A label of `un
         +resolved` is used when the public evidence is insufficient or c
+ontradictory. An AI-only review is never entered as a human lab
+el.  
 47 +  
 48 +## Metrics  
 49 +  
 50 +Binary counts include only candidates whose prediction is `incl
         +uded` or `excluded` and whose human label is `eligible` or `not
         +_eligible`:  
 51 +  
 52 +| | Human: eligible | Human: not_eligible |  
 53 +|---|---|---|  
 54 +| Predicted included | TP | FP |  
 55 +| Predicted excluded | FN | TN |  
 56 +  
 57 +- **Precision** = TP / (TP + FP).  
 58 +- **Conservative precision** = TP / (TP + FP + U), where U = in
+cluded predictions labelled `unresolved`. Unresolved cases coun
+t as failures.  
 59 +- **Sample recall** = TP / (TP + FN). It is measured only again
+st the frozen candidate list. It does not measure coverage of a
+ll investors in the market.  
 60 +  
 61 +The following are reported separately and never enter the binar
+y counts:  
 62 +  
 63 +- needs_review predictions, broken down by human label;  
 64 +- included/excluded predictions labelled `unresolved`;  
 65 +- included/excluded predictions without a human label;  
 66 +- candidates without a prediction.  
 67 +  
 68 +A metric whose denominator is 0 (for example, no human reviews
+or no eligible predictions) is reported as `unavailable` with a + reason, never as 0%. Results show numerators, denominators, an
+d candidate IDs for each cell. Missing values are not counted a
+s correct.

Ran 1 shell command (ctrl+o to expand)

● Predictions and human labels are now kept in separate files and evaluated
separately. All four checks pass:

- npm test: 42 tests pass, 0 fail.
- npm run validate: passes for candidates (3), investors (0) and reviews (0).
- npm run evaluate: exits 0. All three metrics show as unavailable, and all 3
  candidates are listed as having no prediction.
- git diff --check: no whitespace errors. Git printed only warnings that it
  will convert line endings to Windows style, because your Git is set to do
  that.

No investor records, candidate records or human labels were added or changed,
nothing was searched online, and nothing is committed. One side effect: to
include the two new test files in git diff --check, I ran git add -N on them.
That marks them in the Git index but doesn't commit them; git reset
tests/candidates.test.js tests/reviews.test.js undoes it.

How it works

- Predictions stay in data/investors.json: each record's decision (included /
  excluded / needs_review), linked to the candidate list by candidateId.
- Human labels go only in data/reviews.json (eligible / not_eligible /
  unresolved), each with reviewer, review date, reason and the source URLs
  reviewed. No code writes labels.
- Freezing: npm run fingerprint prints fingerprints of the candidate list and
  the predictions, and writes nothing. A person copies them into freeze in
  data/reviews.json before labelling starts. If either file changes
  afterwards, evaluate reports it and fails.

Files changed

- src/evaluate.js: rewritten. It joins candidates, predictions and labels and
  counts TP/FP/TN/FN with the candidate IDs in each. needs_review predictions,
  unresolved labels, unreviewed predictions and candidates with no prediction
  are all listed separately, outside the binary counts. It calculates:
  - precision;
  - conservative precision, counting unresolved included predictions as
    failures;
  - sample recall, labelled as measured only against the frozen candidate
    list.

  Any metric with a denominator of 0 is reported as unavailable with a reason.

- src/validate.js: new review checks (allowed labels, required fields, HTTPS
  URLs, one label per candidate, candidate must be in the list, fingerprint
  format). Investor records may now carry candidateId.
- src/cli.js and package.json: validate now also checks reviews; new
  fingerprint command.
- data/reviews.json: added an empty freeze block. Still no labels.
- docs/evaluation.md: rewritten with the current status, how predictions and
  labels are kept apart, the freezing steps, the review protocol, and metric
  definitions.
- docs/plan.md: Evaluation section updated. The status now matches the files:
  3 unfrozen candidates from one announcement, 0 predictions, 0 labels, and
  exactly which evidence items have recorded manual checks.
- Tests: tests/evaluate.test.js rewritten; tests/reviews.test.js is new. All
  test data is fictional.

Remaining limitations

- Labels can't be proven human. The validator checks a label's structure, not
  who made it. Whether a label really comes from a person depends on the
  review process and your Git history.
- Records without candidateId still pass npm run validate. The link is
  enforced only by evaluate, which reports such records as issues.
- Some cases fall outside precision and recall. Eligible candidates predicted
  needs_review aren't counted against recall, and unreviewed included
  predictions aren't counted against precision. Both are listed separately but
  not folded into any metric.
- The README.md status paragraph is still out of date. It says only "selected
  Credo and Tilia" claims were checked. I left it alone because you asked for
  plan.md and evaluation.md only.
- Still outstanding: a frozen candidate list drawn from the planned
  directories, the predictions themselves, the human labels, the global
  estimate, and the AI conversation exports.
