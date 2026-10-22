# Czech VC Investor Database — pilot

An auditable pilot for identifying venture capital investors whose main operating office is in the Czech Republic. The project focuses on evidence quality: every included investor needs a dated public source confirming a direct investment. Missing public information is recorded as unknown rather than guessed.

## Current status

The project scaffold, quality-check scripts, and first-pass profiles for three Czech VC candidates are in place. All three are named by Delta Green as investors in a dated 2024 financing. Profile sources have been collected for Credo Ventures, Tilia Impact Ventures, and Purple Ventures; the human review is still in progress. They are not yet final included records, and no precision result or global scale estimate is claimed. Because the three candidates were discovered through one recipient announcement, this is a demonstration sample rather than a representative estimate of the Czech VC market.

## Scope

- Unit of record: an investment organization or manager. Related funds are linked to it and are not counted as separate investors.
- Pilot geography: main operating office in the Czech Republic.
- Investor type: venture capital.
- Public sources only.
- Active status: a dated investment event within the 36 months before the dataset freeze, plus a current investment strategy. This is a project rule for the pilot, not a universal definition.

See docs/plan.md for inclusion rules, source policy, evaluation, and limitations.

## Run locally

Requires Node.js 20 or newer. No third-party packages are needed.

    npm test
    npm run validate
    npm run evaluate

The commands read data/investors.json and data/reviews.json. The current files are intentionally empty until records and human review are ready.

## Data and evidence

Each investor record keeps its decision and evidence together. Each evidence item identifies the claim it supports, the public URL, the page title, publication or event date when known, access date, and a short supporting excerpt. Search snippets and directory membership can help discover candidates but do not prove investment activity.

Capital figures must retain their meaning (for example, fund size, target size, AUM, or close amount), date, and scope. A startup's round size is not the investor's cheque size. Undisclosed values remain null with a reason.

## AI use

AI may help find candidate sources, extract structured claims, and draft code. A human must open and assess evidence before a record is marked included. AI confidence is not evidence and a second AI pass is not counted as independent manual review. The final README will document actual instructions, checks, and observed AI errors. Original AI conversation exports will be stored in ai-log/; no conversation will be represented as an export unless it came from the named tool.

## License and reuse

Source links and short factual notes are included for verification. This repository does not republish full third-party articles or claim rights over source material.
