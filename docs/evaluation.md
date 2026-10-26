# Evaluation

## Results (human review completed 2026-10-26)

All 20 frozen candidates have a human label in data/reviews.json (reviewer Leonid Kuznetsov, 2026-10-26). The candidate frame and predictions were frozen on 2026-10-22 (`datasetDate`), and `npm run evaluate` reports `"matches"` for both recorded fingerprints, so the metrics describe the frozen version.

### Labels

| Human label | Count | Candidates |
|---|---|---|
| eligible | 5 | Credo Ventures, Tilia Impact Ventures, Purple Ventures, Orbit Capital, KAYA VC |
| not_eligible | 8 | Innova Capital, mAccelerator.vc, Limerock Ventures, Sandberg Capital, EVERITA Capital, MAM Private Equity Fund, Heartcore Capital, HitHit |
| unresolved | 7 | UP271, Lighthouse venture, Enern, RSJ Investments, Impulse Ventures, PurposeTech, i&i Biotech Investments |

Why each candidate received its label is recorded in the `reason` field of data/reviews.json. Main reasons for not_eligible: private equity rather than VC (Innova, Sandberg, EVERITA, MAM), principal base outside Czechia (Innova and mAccelerator in Poland, Limerock and Sandberg in Slovakia, Heartcore in Denmark), and not an equity investor (HitHit). Unresolved cases and their specific uncertainty:

| Candidate | Specific uncertainty |
|---|---|
| UP271 | Investor type, operating office (only address is also the registered seat) and a dated direct investment are not established. |
| Lighthouse venture | Identity conflict: the directory links to a US firm; a separate Czech VC (lhv.vc) has a similar name. |
| Enern | Boundary with KAYA and the current investment manager is unclear. |
| RSJ Investments | No qualifying recent direct company investment confirmed in the reviewed evidence. |
| Impulse Ventures | The 2025 Safetica investment is attributed to Impulse Capital; the link to Impulse Ventures is not established. |
| PurposeTech | Prague address is a mailing address; principal operating base not established. |
| i&i Biotech Investments | Decision-making location unclear between the Luxembourg fund and the Prague adviser. |

None of the unresolved labels asserts that an organization is closed or inactive.

### Confusion counts (output of `npm run evaluate`)

| | Human: eligible | Human: not_eligible |
|---|---|---|
| Predicted included | TP = 3 (Credo, Tilia, Purple) | FP = 0 |
| Predicted excluded | FN = 0 | TN = 7 (Innova, Limerock, Sandberg, EVERITA, MAM, Heartcore, HitHit) |

Reported separately, outside the binary counts:

| Group | Candidates |
|---|---|
| Included, labelled unresolved | PurposeTech |
| Excluded, labelled unresolved | Lighthouse venture |
| needs_review, labelled eligible | Orbit Capital, KAYA VC |
| needs_review, labelled not_eligible | mAccelerator.vc |
| needs_review, labelled unresolved | UP271, Enern, RSJ Investments, Impulse Ventures, i&i Biotech Investments |

### Metrics

| Metric | Definition | Value |
|---|---|---|
| Precision | TP / (TP + FP) | 3 / 3 = 1.00 (95% Wilson interval 0.44–1.00) |
| Conservative precision | TP / (TP + FP + U), U = included predictions labelled unresolved | 3 / 4 = 0.75 (95% Wilson interval 0.30–0.95) |
| Sample recall | TP / (TP + FN), frozen frame only | 3 / 3 = 1.00 |

How unresolved cases are treated: ordinary precision leaves out the included prediction that the reviewer could not resolve (PurposeTech). Conservative precision counts it as a failure, because the database would have published a record that a human could not confirm. Conservative precision is the more relevant figure for a reliable database.

Additional pilot measurements (computed by hand from the same files; not part of the evaluator output):

- **Eligible capture by the included prediction:** of the 5 eligible organizations, 3 were predicted included and 2 (Orbit, KAYA) were predicted needs_review. None was wrongly excluded. Sample recall above ignores the 2 needs_review cases by definition, so it overstates how much of the eligible set the automatic stage alone would publish.
- **needs_review yield:** of 8 needs_review predictions, 2 became eligible, 1 not_eligible, 5 unresolved. needs_review worked as intended (no confident errors), but it pushed most of the effort to the human reviewer.
- **Human review share:** 20 of 20 candidates (100%) were human-reviewed. The frame was too small to test sampling of excluded cases.
- **Final records (data/final-investors.json):** 5 records with 49 source items, 13 of which carry the user's own recorded source check. Investor type, operating office, sector, stage, and ticket are available for 5/5. Firm-wide AUM is available for 1/5 (KAYA's undated, self-reported figure). The investor's own cheque is disclosed for 0 of 7 recorded investments; all 7 record the round total separately. 6 of 7 investments have an exact event date; 1 (FaceUp, May 2026) has a month only.
- **Errors caught in review:** the preliminary stage included PurposeTech on the basis of a mailing address, which the reviewer did not accept as an operating office. The stage also excluded Lighthouse venture without catching the identity conflict with the Czech Lighthouse Ventures.

### Limits

- n = 20, and only 4 included predictions. The intervals above are wide; a precision of 1.00 on 3 cases is not evidence of near-perfect accuracy at scale.
- The three preserved candidates (Credo, Tilia, Purple) came from one recipient announcement rather than the seeded draw, so they are not a random sample and are all eligible (docs/discovery.md). Metrics are therefore optimistic. Among the 17 rule-drawn candidates, 2 are eligible, 7 unresolved and 8 not_eligible.
- One human reviewer labelled all candidates; there is no inter-reviewer agreement measure. The labels were decided in a separate conversation and entered here as confirmed by the user.
- Sample recall is measured only against the frozen 20-candidate frame. It says nothing about organizations absent from the two discovery directories.
- The result covers one segment (Czech VC managers listed in two Czech directories). It cannot be generalized to other countries, to PE, family offices, angels, or private individuals, or to the whole investor market, where disclosure and definitions differ (docs/global-estimate.md).

The `manualVerification` notes in data/candidates.json record that the user checked individual sources. They are not human eligibility labels and are not used by the evaluation.

## Separating predictions from human labels

| | Preliminary prediction | Human label |
|---|---|---|
| File | data/investors.json (`records[].decision`) | data/reviews.json (`reviews[]`) |
| Values | `included`, `excluded`, `needs_review` | `eligible`, `not_eligible`, `unresolved` |
| Link to frame | `candidateId` → data/candidates.json | `candidateId` → data/candidates.json |
| Created by | Research workflow (may be AI-assisted) | A human reviewer only; code never writes labels |

Each human label records:

```json
{
  "candidateId": "candidate-…",
  "label": "eligible | not_eligible | unresolved",
  "reviewer": "name or initials",
  "reviewDate": "YYYY-MM-DD",
  "reason": "why the candidate does or does not meet the inclusion rules",
  "sourceUrls": ["https://… sources the reviewer opened"]
}
```

`npm run validate` checks the structure of labels: allowed values, required fields, HTTPS source URLs, one label per candidate, and candidates that exist in the frozen list.

## Freezing

1. Finalize data/candidates.json (the frozen candidate list) and the preliminary predictions in data/investors.json.
2. Run `npm run fingerprint`. It prints fingerprints of the candidate list and the predictions and writes nothing.
3. Copy them into `freeze` in data/reviews.json, with `frozenOn`, and commit before any human labelling starts.
4. `npm run evaluate` compares the current files with the fingerprints. If either has changed, it reports an issue and exits with an error, because the metrics would no longer describe the frozen version. Corrections made after review go into a separately labelled corrected dataset.

## Human review protocol

For each candidate in the frozen list, including predicted exclusions and needs_review cases, the reviewer opens the sources and checks identity, the Czech principal operating office, investor type, a completed direct investment, and the relevant dates against the rules in docs/plan.md. The reviewer then records one label with a reason and the URLs they opened. A label of `unresolved` is used when the public evidence is insufficient or contradictory. An AI-only review is never entered as a human label.

## Metrics

Binary counts include only candidates whose prediction is `included` or `excluded` and whose human label is `eligible` or `not_eligible`:

| | Human: eligible | Human: not_eligible |
|---|---|---|
| Predicted included | TP | FP |
| Predicted excluded | FN | TN |

- **Precision** = TP / (TP + FP).
- **Conservative precision** = TP / (TP + FP + U), where U = included predictions labelled `unresolved`. Unresolved cases count as failures.
- **Sample recall** = TP / (TP + FN). It is measured only against the frozen candidate list. It does not measure coverage of all investors in the market.

The following are reported separately and never enter the binary counts:

- needs_review predictions, broken down by human label;
- included/excluded predictions labelled `unresolved`;
- included/excluded predictions without a human label;
- candidates without a prediction.

A metric whose denominator is 0 (for example, no human reviews or no eligible predictions) is reported as `unavailable` with a reason, never as 0%. Results show numerators, denominators, and candidate IDs for each cell. Missing values are not counted as correct.
