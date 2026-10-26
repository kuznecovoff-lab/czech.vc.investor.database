# Candidate discovery (2026-10-22)

Status: pilot discovery frame of 20 organizations with preliminary predictions. The frame and predictions were frozen on 2026-10-22; their fingerprints are recorded in data/reviews.json. Human review was completed on 2026-10-26, and the 20 labels are in data/reviews.json (results in docs/evaluation.md). This document describes the frame and predictions as frozen; it was not changed to match the labels.

## Discovery evidence, predictions, and human labels

| Layer | File | Values | Created by |
|---|---|---|---|
| Discovery evidence | data/discovery/ (snapshots), data/candidates.json (`discoverySources`, `evidence`) | listings, source URLs, excerpts | Research workflow (AI-assisted), frozen 2026-10-22 |
| Preliminary predictions | data/investors.json (`decision`) | `included`, `excluded`, `needs_review` | Research workflow (AI-assisted), frozen 2026-10-22 |
| Human labels | data/reviews.json (`label`) | `eligible`, `not_eligible`, `unresolved` | Human reviewer, 2026-10-26 |
| Final records | data/final-investors.json | eligible managers only | Built from human labels and checked public sources, 2026-10-26 |

A directory listing is discovery evidence only. Predictions were made before human review and are never edited to match labels; the evaluation compares the two.

## Sources

Both directories were used for discovery only. A listing or membership is not evidence of investment activity.

| Source                                  | URL                                                          | Accessed   | Entries                            | Snapshot                                               |
| --------------------------------------- | ------------------------------------------------------------ | ---------- | ---------------------------------- | ------------------------------------------------------ |
| CzechStartups.gov.cz investor directory | https://czechstartups.gov.cz/en/startup-ecosystem/investors/ | 2026-10-22 | 50                                 | data/discovery/czechstartups-investors-2026-10-22.json |
| CVCA full members                       | https://cvca.cz/en/category/full-members/                    | 2026-10-22 | 27 (one page, no pagination found) | data/discovery/cvca-full-members-2026-10-22.json       |

Notes on capture:

- CzechStartups: names and listing URLs were checked against the raw page HTML. All 50 names and slugs match, in page order. The page shows no date. `directoryCategory` is the filter label attached to an entry (for example `#VentureCapital` or `#Crowdfunding`). Many entries carry term IDs with no visible filter label; these are stored as `directoryTermIds` and their meaning is unknown.
- CVCA: the WebFetch tool rejected the site's TLS certificate. The page was downloaded with curl, which completed certificate verification without errors (no verification bypass). Member profiles contain self-reported figures (fund volume, ticket size). These are recorded only as "directory-stated" notes and are not used as evidence for decisions.

## Frame selection

1. **Merge and deduplicate.** The two snapshots were merged by normalized name (`src/frame.js`: lowercase, diacritics and legal suffixes removed). Two aliases were resolved by hand from the listings: `N1` = `Nation1` (the CzechStartups slug is `nation-1`) and `Genesis Capital` = `Genesis Capital Equity s.r.o.`. The union has 69 organizations; 8 appear in both lists (Kaya VC, Tensor Ventures, Tilia Impact Ventures, N1/Nation1, Genesis Capital, Credo Ventures, INVEN Capital, DEPO Ventures).
2. **Preserve existing candidates.** Credo Ventures, Tilia Impact Ventures, and Purple Ventures were already in data/candidates.json (originally found through one Delta Green announcement). All three also appear in the CzechStartups directory, and Credo and Tilia in CVCA.
3. **Fill to 20 by a fixed rule.** The remaining 17 are the first 17 organizations in SHA-256 order of `seed + ":" + normalizedName`, with seed `assignment-a-frame-2026-10-22`. The order depends only on the name, not on expected eligibility, so the frame was not chosen to improve precision. `tests/frame.test.js` re-derives the frame from the snapshots and checks that it matches data/candidates.json.

The selected 17 include VC firms, private equity, a bank-sponsored fund, a crowdfunding platform, and foreign firms. This reflects the mix in the directories.

**Limitation:** the three preserved candidates were not drawn by the rule. They all come from the same announcement and are likely eligible, so the frame over-represents eligible VC firms compared with a purely random draw.

## Research method per candidate

For each candidate the official website was read, and a dated, completed investment was searched for in investor, recipient, or news sources. Aggregators (CB Insights, Caplight, PitchBook, SeedTable, Dealroom) were used only as leads and are never cited as evidence. Quotes in data/candidates.json were checked against the downloaded page HTML. One tool summary (AIN, Lifeyear) contained a grant/VC split that is not on the page; it was not recorded. Startup round totals are never recorded as an individual investor's cheque.

## Preliminary predictions

Predictions are in data/investors.json (`decision`, linked by `candidateId`). Rules applied (docs/plan.md):

- `included` only if the VC type, the Czech principal operating office, and a dated completed direct investment within the 36-month window are all supported.
- `excluded` only when public evidence clearly places it outside scope.
- `needs_review` otherwise.

| Candidate                          | Discovery                        | Prediction   | Main reason                                                                                    |
| ---------------------------------- | -------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| Credo Ventures                     | Delta Green, CzechStartups, CVCA | included     | VC; Prague office (official site); Delta Green investment 2024-05-27                           |
| Tilia Impact Ventures              | Delta Green, CzechStartups, CVCA | included     | VC; Prague address (official site); Delta Green 2024-05-27 and Lifeyear report 2025-07-01      |
| Purple Ventures                    | Delta Green, CzechStartups       | included     | VC; "Brno-based" and Brno address on official site; Delta Green 2024-05-27                     |
| PurposeTech                        | CzechStartups                    | included     | Pre-seed fund; Prague mailing address (official site); Lifeyear report 2025-07-01 (news media) |
| UP271                              | CzechStartups                    | needs_review | Prague office; investor type and dated investment not established                              |
| Enern                              | CzechStartups                    | needs_review | Prague and Warsaw offices; "family of investment vehicles"; relationship to KAYA unresolved    |
| Orbit Capital                      | CVCA                             | needs_review | Growth equity/debt (borderline); office only in directory; no dated investment found           |
| RSJ Investments                    | CzechStartups                    | needs_review | Diversified group; direct VC role not established                                              |
| mAccelerator.vc                    | CzechStartups                    | needs_review | Official site failed TLS (expired certificate); mBank page redirects                           |
| Impulse Ventures                   | CzechStartups                    | needs_review | Official site failed TLS; recipient release names "Impulse Capital"                            |
| Kaya VC                            | CzechStartups, CVCA              | needs_review | Four offices, principal not identified; law-firm source does not confirm completion            |
| i&i Biotech Investments            | CVCA                             | needs_review | Completed investment by a Luxembourg fund; manager and operating office unresolved             |
| Lighthouse venture                 | CzechStartups                    | excluded     | Official site linked by the directory gives only a US address                                  |
| Innova Capital                     | CVCA                             | excluded     | PE, controlling stakes; Warsaw (directory)                                                     |
| Limerock Ventures                  | CzechStartups                    | excluded     | Bratislava office (official site)                                                              |
| Sandberg Capital                   | CVCA                             | excluded     | PE fund manager                                                                                |
| EVERITA Capital                    | CVCA                             | excluded     | Growth PE for SMEs with at least €3m revenue                                                   |
| MAM Private Equity Fund SICAV a.s. | CVCA                             | excluded     | PE buying established firms (succession)                                                       |
| Heartcore Capital                  | CzechStartups                    | excluded     | Copenhagen and Paris offices                                                                   |
| HitHit                             | CzechStartups                    | excluded     | Reward-based crowdfunding platform                                                             |

Totals: 4 included, 8 needs_review, 8 excluded.

## Could not verify

- **Impulse Ventures** (impulseventures.com) and **mAccelerator.vc** (maccelerator.vc): TLS verification failed on 2026-10-22, so the official sites were not read. Certificate checks were not bypassed.
- **Kaya VC / Enern**: whether these are one manager or separate managers is unresolved.
- **i&i**: the manager (general partner) of i&i Biotech Fund I SCSp is not named on the official site.
- **UP271, Enern, Orbit Capital, RSJ**: no investor or recipient announcement of a dated completed investment was found. Aggregator entries exist but were not used.
- **PurposeTech and Tilia (Lifeyear)**: the source is a news article, not the investor's or recipient's own announcement. The event date is the article date; the closing date is not stated.
- **Purple Ventures**: the Brno address is the legal footer line. The operating-location claim rests on a "Brno-based" statement on the same page.
- **PurposeTech**: its address is labelled a mailing address and is the same building as Tilia's (Drtinova 557/10).
- **Kaya VC (E2B)**: the Pillsbury release does not state that the round closed.
