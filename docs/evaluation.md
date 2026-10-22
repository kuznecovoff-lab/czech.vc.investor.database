# Evaluation

## Status (2026-10-22)

Not measured. `npm run evaluate` currently reports every metric as unavailable because:

- data/candidates.json has a 20-organization discovery frame (docs/discovery.md). It is not frozen.
- data/investors.json has 20 preliminary predictions (4 included, 8 needs_review, 8 excluded), not human-reviewed.
- data/reviews.json has 0 human labels, and its freeze fingerprints are unset.

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
