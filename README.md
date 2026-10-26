# Czech VC Investor Database — pilot

An auditable pilot for Assignment A, "A Reliable Investor Database". It tests one method on one segment: venture capital managers whose principal operating office is in the Czech Republic. Every included investor needs dated public evidence of a completed direct investment, and the method's accuracy is measured against human review. This is a validation of the method, not a complete Czech or global investor database.

The final report is in [docs/report.md](docs/report.md).

## Scope

- Unit of record: the investment manager organization. Funds and vehicles are linked to it and are not counted as separate investors.
- Pilot geography: principal operating office in the Czech Republic. A registered or mailing address alone does not count.
- Investor type: venture capital. PE, family offices, angels, and large private investors belong to the broader concept and are covered only in the global estimate.
- Public sources only. Directories are used for discovery, not as proof.
- Active status: a completed direct investment within the 36 months before the frozen dataset date (2026-10-22), that is, on or after 2023-10-22.

Inclusion rules, verification method, and expected reliability are in [docs/plan.md](docs/plan.md).

## Status and results (2026-10-26)

- 20 candidates were drawn from the CzechStartups investor directory and the CVCA member list ([docs/discovery.md](docs/discovery.md)).
- Preliminary predictions were made: 4 included, 8 needs_review, 8 excluded. The frame and predictions were frozen on 2026-10-22, and both fingerprints still match.
- A human reviewer (Leonid Kuznetsov) labelled all 20 on 2026-10-26: 5 eligible, 8 not_eligible, 7 unresolved.
- Precision is 3/3. Conservative precision, which counts an unresolved included prediction as a failure, is 3/4. Sample recall within the frame is 3/3. The sample is small, so these figures are not a precision claim for a larger database ([docs/evaluation.md](docs/evaluation.md)).
- The final records cover the 5 eligible managers: Credo Ventures, Tilia Impact Ventures, Purple Ventures, Orbit Capital, and KAYA VC.
- Global universe ranges and scaling effort and cost are in [docs/global-estimate.md](docs/global-estimate.md).

Limitations:

- one country, one category, 20 candidates, one reviewer;
- three candidates were not drawn at random;
- organizations absent from both directories are not covered;
- investors' individual cheques and firm-wide AUM are mostly undisclosed;
- the global figures are low-confidence ranges.

## Run locally

Requires Node.js 20 or newer; there are no third-party packages. Run these from the project folder. On Windows PowerShell use `npm.cmd`; on other systems use `npm`.

    npm.cmd test
    npm.cmd run validate
    npm.cmd run evaluate
    npm.cmd run fingerprint

What each command does:

- `test` runs the unit tests. One test re-derives the frozen 20-candidate frame from the directory snapshots.
- `validate` checks all four data files against their schemas, including that every final record belongs to a candidate labelled eligible and that every fact cites a source.
- `evaluate` prints confusion counts and metrics. It exits with an error if the candidate or prediction files no longer match the recorded freeze.
- `fingerprint` prints the current fingerprints for comparison with `freeze` in data/reviews.json. It writes nothing.

## Data files

| Path | Contents |
|---|---|
| data/discovery/ | Snapshots of the two discovery directories (2026-10-22) |
| data/candidates.json | Frozen 20-candidate frame with discovery sources and research evidence |
| data/investors.json | Frozen preliminary predictions (`included` / `excluded` / `needs_review`) |
| data/reviews.json | Freeze metadata (date and fingerprints) and the 20 human labels (`eligible` / `not_eligible` / `unresolved`) with reasons and reviewed URLs |
| data/final-investors.json | Final records for the 5 eligible managers; every fact cites its own source items |
| src/ | Frame selection, validators, evaluator, command-line entry point |
| tests/ | Unit tests (fictional data, except the frame re-derivation) |
| docs/ | Plan, discovery, evaluation, global estimate, final report |
| ai-log/ | AI conversation exports (see ai-log/README.md) |

Each evidence item records the claim it supports, URL, title, publisher, publication date, event date where relevant, access date, and a short excerpt. Facts that could not be established are null with a reason. A startup's round total is never recorded as an investor's cheque. Fund size, target, first close, amount raised, AUM, and ticket are kept separate.

## AI use

Two AI tools were used:

- **Claude Code** (Anthropic), in a VS Code extension, in two sessions on 2026-10-22 and 2026-10-26.
  - Session 1: audited the scaffold, revised the plan, and designed the prediction/label separation and the evaluator. It ran candidate discovery with web tools, wrote the candidate evidence and preliminary predictions, recorded the freeze, and made commit 73269ec.
  - Session 2: prepared research notes on each candidate for the human review and corrected stale status text. It entered the labels the reviewer confirmed, verified sources and built data/final-investors.json with its validator, and wrote the evaluation results, global estimate, and report.
- **ChatGPT** (OpenAI): per the reviewer, the human review discussion and the label decisions took place in a ChatGPT conversation outside this repository. That conversation is not a Claude Code export and is not presented as one.

The Git history before 73269ec (13 commits, 10:07–10:40 UTC on 2026-10-22) predates the first Claude Code session on record. All commits up to 73269ec carry the repository-local identity "Codex assistant <codex@localhost>", and .gitignore lists `.codex/`. Which tool produced the earlier commits is for the author to state; this README does not claim it.

How outputs were checked:

- Labels were decided by the human reviewer, not generated by AI. Code never writes labels.
- The user manually checked individual sources for the first three candidates; these checks are recorded as `manualVerification` in data/candidates.json and as `userChecked` in data/final-investors.json.
- Quotes were checked against fetched page text, and the frozen files are protected by fingerprints.
- Aggregator sites (CB Insights, PitchBook, Caplight, SeedTable, Dealroom) were used only as leads and never cited as evidence.

AI errors and problems found:

- A tool summary of the AIN Lifeyear article contained a grant/VC split not present on the page; it was not recorded (docs/discovery.md).
- Search summaries reported deals that could not be confirmed (for example a Credo-led Delta Green round in October 2025, and a Preqin "8,400 firms in 2019" figure). These were not used.
- A Vestbee article gave two different lead investors for the same FaceUp round; the record does not rely on its lead attribution.
- The preliminary stage included PurposeTech on the strength of a mailing address and excluded Lighthouse venture without spotting the identity conflict; human review caught both.
- Claude Code first assumed that an empty data/reviews.json meant no review had taken place; the user corrected this.
- A candidate ID supplied with the labels ("candidate-rsj-investments") did not exist in the frame. The validator would have rejected it, and the frame ID "candidate-rsjinvestments" was used.

Authentic Claude Code exports belong in ai-log/ and must be created with Claude Code's `/export` command; see ai-log/README.md for what is present.

## License and reuse

Source links and short factual excerpts are included for verification. This repository does not republish full third-party articles or claim rights over source material.
