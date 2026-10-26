# Assignment A: A Reliable Investor Database — final report

Leonid Kuznetsov, 2026-10-26

## Summary

This project tests a method for building an investor database in which every included investor is backed by dated public evidence and measured against human review. The pilot covers one segment: venture capital managers whose principal operating office is in the Czech Republic. It is a validation of the method on that segment, not a complete Czech or global investor database.

- 20 candidates were drawn from two public Czech directories, given preliminary predictions, and frozen on 2026-10-22.
- A human reviewer labelled all 20: 5 eligible, 8 not eligible, 7 unresolved.
- Measured precision of the included predictions: 3/3 (1.00). Conservative precision, counting an unresolved included record as a failure: 3/4 (0.75). The sample is very small, so the 95% intervals are wide (0.44–1.00 and 0.30–0.95).
- The final database holds the 5 eligible managers, with a separate source for each fact.
- A worldwide database of observable investor organizations (VC, PE, family offices) is estimated at about 11,000–24,000 organizations. A first build is estimated at about 7,000–82,000 person-hours, or USD 0.37m–4.1m in wage-only US benchmark terms (base case USD 1.19m), plus overhead, AI usage, and infrastructure. Angels and wealthy individuals cannot be reliably enumerated from public data.

## Method

**Unit of record.** The VC manager organization. Funds and vehicles are linked to it, not counted separately.

**Inclusion rules** (docs/plan.md). An organization is included only if public sources establish all of the following:

- its identity;
- that it is a VC-type investor;
- a Czech principal operating office (a registered or mailing address alone does not count);
- a dated, completed, direct investment in a company.

"Active" also requires such an investment on or after 2023-10-22, which is 36 months before the frozen dataset date of 2026-10-22. PE-only firms, crowdfunding platforms, fund-of-funds-only entities, and organizations based abroad are excluded. Anything with missing or conflicting evidence is left unresolved rather than guessed.

**Evidence policy.** Every fact carries its source URL, title, publisher, publication date, event date where relevant, access date, and a short excerpt. Directories are used only for discovery. A startup's round total is never recorded as an investor's cheque. Fund size, target, first close, amount raised, AUM, and ticket are kept apart. Lack of recent public mentions is never treated as proof that a firm is inactive.

**Workflow.**

1. Snapshot the CzechStartups investor directory (50 entries) and the CVCA full-member list (27 entries), and merge them into 69 unique organizations.
2. Keep 3 candidates found earlier and draw 17 more by a seeded hash of the normalized name, so the draw does not depend on expected eligibility.
3. Research each candidate with AI assistance and record a preliminary prediction (`included`, `excluded`, `needs_review`).
4. Freeze the frame and the predictions with SHA-256 fingerprints.
5. Have a human reviewer label every candidate (`eligible`, `not_eligible`, `unresolved`).
6. Compute metrics with the project's evaluator, which refuses to report if the frozen files have changed.

## Czech VC pilot results

| Human label | Candidates |
|---|---|
| eligible (5) | Credo Ventures, Tilia Impact Ventures, Purple Ventures, Orbit Capital, KAYA VC |
| not_eligible (8) | Innova Capital (Polish PE), mAccelerator.vc (Poland), Limerock Ventures (Slovakia), Sandberg Capital (Slovak PE), EVERITA Capital (growth PE), MAM Private Equity Fund (buyouts), Heartcore Capital (Copenhagen), HitHit (reward crowdfunding) |
| unresolved (7) | UP271, Lighthouse venture, Enern, RSJ Investments, Impulse Ventures, PurposeTech, i&i Biotech Investments |

The unresolved cases are about evidence, not activity. They include:

- an identity conflict (Lighthouse);
- an unclear boundary between related managers (Enern and KAYA);
- a fund headquartered in Luxembourg with a Prague adviser (i&i);
- a mailing address only (PurposeTech);
- an investment attributed to a differently named entity (Impulse);
- limited public evidence (UP271, RSJ).

## Selected investor records (data/final-investors.json)

| Manager | Base | Focus and stage | Ticket | Capital figure (meaning) | Dated completed investment |
|---|---|---|---|---|---|
| Credo Ventures | Prague (also Kraków office) | No fixed sector; CEE founders; pre-seed onwards | USD 1–5M | USD 88M, Credo Stage V fund size (2026-03-23) | Delta Green, May 2024 (round EUR 2.2m); Axoflow, Jan 2025 (round USD 7m) |
| Tilia Impact Ventures | Prague | Impact (climate, education, health, social equity); pre-seed to Series A | EUR 0.3–1.2m initial | EUR 30m, Fund II as stated at launch | Delta Green, May 2024 (lead); FaceUp, May 2026 (round USD 5m) |
| Purple Ventures | Brno | CEE+ tech; pre-seed and seed | EUR 250–400k initial | Fund II target EUR 40m; over CZK 700m raised by 2026-03-12 | Delta Green, May 2024 |
| Orbit Capital | Prague (also Warsaw) | Technology scale-ups; growth equity and venture debt | Growth Debt II EUR 3–10m | Growth Debt II target EUR 100m, EUR 70m first close (2025) | CloudTalk Series B, Jan 2024 (round USD 28m) |
| KAYA VC | Prague (offices also in Warsaw, San Francisco, London) | Generalist; pre-seed to scale | USD 1–3M | USD 85M "current fund"; USD 500M "AUM total" (self-reported, undated) | E2B Series A, Jul 2025 (round USD 21M) |

None of the 7 recorded investments discloses the investor's own cheque. Round totals are shown only as round totals. For Orbit's CloudTalk participation the instrument is not stated, and the EIF lists CloudTalk among Orbit's debt-fund investments. KAYA may overlap with the Enern record.

## Manual-review accuracy

| | Human: eligible | Human: not_eligible |
|---|---|---|
| Predicted included | 3 | 0 |
| Predicted excluded | 0 | 7 |

- Precision = TP / (TP + FP) = 3/3.
- Conservative precision = TP / (TP + FP + unresolved included) = 3/4. PurposeTech was predicted included and labelled unresolved.
- Sample recall = TP / (TP + FN) = 3/3, within the frozen frame only.
- Outside the binary counts:
  - 8 needs_review predictions: 2 eligible (Orbit, KAYA), 1 not eligible, 5 unresolved.
  - 1 excluded prediction labelled unresolved (Lighthouse).

**Limits of these results:**

- The sample is small.
- The 3 preserved candidates were not drawn at random.
- There was one reviewer.
- The results apply only to Czech VC managers listed in two directories.

Full details are in docs/evaluation.md.

## Global scale and cost estimate

Full details are in docs/global-estimate.md.

**Reference figures:**

- 3,417 US VC firms (NVCA, year-end 2023);
- more than 1,750 European PE and VC firms (Invest Europe survey for 2024);
- about 7,000 PE firms worldwide (American Investment Council, via Vault; undated);
- 8,030 single family offices (Deloitte, 2024);
- 445,535 active US angels (UNH Center for Venture Research, 2024);
- 510,810 individuals worth over USD 30m (Altrata, mid-2025).

**Observable organizations in scope:** 11,358 (low), 16,812 (base), 23,518 (high), after a 15% VC/PE overlap adjustment and an assumed 25–60% share of family offices with public evidence of direct investments. Confidence is low. Angels and wealthy individuals are reported for context only.

**Effort and cost:** about 17,000–71,000 candidates to process, at 20–60 minutes each with 100% human review:

| | Low | Base | High |
|---|---|---|---|
| Initial build, person-hours | 7,263 | 23,574 | 81,730 |
| Initial build, wage-only cost | USD 0.37m | USD 1.19m | USD 4.10m |
| Maintenance per year | USD 0.07m | USD 0.34m | USD 1.76m |

The rates are BLS May 2025 US medians: USD 49.79/h for an analyst and USD 65.38/h for an engineer. The full formula, with an overhead multiplier and AI/API costs as parameters, is in docs/global-estimate.md. The pilot did not time candidates or meter AI usage, so the minutes per candidate are assumptions.

## Limitations

- One country and one investor category, with 20 candidates and one human reviewer.
- Directory coverage is incomplete. Organizations not listed in either directory were not considered.
- Several facts rest on self-reported or directory-stated figures. They are labelled as such and never used as the only proof of eligibility.
- 13 of the 49 source items in the final database carry the reviewer's own recorded source check. The others were read with AI tooling for candidates the reviewer labelled eligible.
- Global figures come from sources with different definitions and dates. Several are secondary or undated.

## Reproducing the work

Requires Node.js 20 or newer; there are no dependencies. On Windows use `npm.cmd`; elsewhere use `npm`.

    npm.cmd test                # unit tests, including re-deriving the frozen frame from the snapshots
    npm.cmd run validate        # schema checks for candidates, predictions, human labels, final records
    npm.cmd run evaluate        # confusion counts and metrics; fails if the frozen files changed
    npm.cmd run fingerprint     # prints the fingerprints to compare with data/reviews.json

The evidence for every fact is linked from data/candidates.json, data/reviews.json, and data/final-investors.json.
