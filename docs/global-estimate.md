# Global investor universe and scaling estimate

Date of estimate: 2026-10-26. All sources were accessed on 2026-10-26 unless stated otherwise.

This is a bounded planning estimate, not a count. The pilot validated a method on one segment (Czech VC managers, 20 candidates). It does not show that a global database exists or that the pilot's accuracy carries over to other segments. Every range below combines a published figure with labelled assumptions; the confidence column says how much weight each range can bear.

## 1. Two kinds of investors

- **Observable organizations** (VC managers, PE managers, single family offices): legal entities that usually have a website, staff, and some public trace of their deals. These can, in principle, be enumerated from public sources and verified record by record with the pilot method.
- **Private individuals** (angel investors, ultra-high-net-worth individuals investing directly): mostly not enumerable from public data. Many do not announce deals, and personal data rules limit what should be collected. Published figures for them are survey or model estimates, not lists. They are reported here for context and excluded from the organization count and the cost model.

## 2. Published reference figures

| Category | Figure | Scope and date | Source | What it supports | Limits |
|---|---|---|---|---|---|
| VC (US) | 3,417 VC firms | US, year-end 2023 | [NVCA Yearbook page](https://nvca.org/nvca-yearbook/) (NVCA, 2024 Yearbook, 27th edition) | Size of the largest single VC market | US only; NVCA/PitchBook definition of an active firm |
| PE and VC (Europe) | more than 1,750 PE and VC firms | Europe, data for 2024 | [SECA summary of Invest Europe's "Investing in Europe: Private Equity Activity 2024"](https://www.seca.ch/en/knowledge-library/newsletters/2025/seca-enewsletter-no-550/private-equity-int-news/investing-in-europe-private-equity-activity-2024/) (SECA, 2025-06-08) | Number of European firms reporting to the survey | Survey participants, not a census; PE and VC are not split |
| PE (world) | about 7,000 PE firms, 6,000 of them in the US | Undated ("today"); page © 2026 | [Vault, "The industry today"](https://legacy.vault.com/industries-professions/industries/private-equity/the-industry-today), citing the American Investment Council | Order of magnitude for PE | Secondary attribution; I could not open an AIC publication with this figure; US-heavy split suggests undercounting outside the US |
| PE (world, historical) | 4,270 PE firms | October 2009 | [WealthBriefing, 2009-11-13](https://www.wealthbriefing.com/html/printarticle.php?id=26481), citing Preqin | Growth trend only | 17 years old |
| Single family offices | 8,030 (projected over 10,720 by 2030); North America 3,180, Asia Pacific 2,290, Europe 2,020, Middle East 290, South America 190, Africa 60 | 2024 | [Deloitte press release, 2024-09-04](https://www.deloitte.com/global/en/about/press-room/global-edition-explores-the-rapid-expansion-family-offices-and-ffers-vision-of-the-future-landscape.html) | Size of the SFO universe | Deloitte estimate; the release does not explain the estimation method (it describes a survey of 354 SFOs); multi-family offices not included |
| Angel investors (US) | 445,535 active angel investors; 55,346 ventures funded; USD 17.9bn invested | US, 2024 | UNH Center for Venture Research, [FY 2024 Analysis Report](https://paulcollege.unh.edu/sites/default/files/media/2025-12/FY%202024%20Analysis%20Report%20Final.pdf) | Scale of the angel population | Figures read from search-result text of this report; the PDF itself could not be opened (TLS certificate error) and was not bypassed. US only; a survey-based estimate of individuals |
| Large private investors | 510,810 individuals with net worth above USD 30m | World, end of June 2025 | [Altrata, World Ultra Wealth Report 2025](https://altrata.com/reports/world-ultra-wealth-report-2025) (September 2025) | Upper bound on individuals able to invest large sums directly | Wealth, not investing activity; most do not invest directly or publicly |

No public source found in this work gives a current worldwide count of VC firms. A newer Altrata edition (2026, 556,850 individuals for 2025) appeared in search results but was not opened; the 2025 edition is used.

## 3. Observable organizations: ranges

| Category | Low | Base | High | Basis | Confidence |
|---|---|---|---|---|---|
| VC managers | 5,000 | 8,000 | 12,000 | US 3,417 (NVCA) plus Europe (part of Invest Europe's 1,750+ PE/VC firms) plus Asia and the rest of the world, for which no public count was found. Rest-of-world shares are assumptions. | Low |
| PE managers | 6,000 | 8,000 | 10,000 | AIC (via Vault) about 7,000 worldwide; its US-heavy split and Invest Europe's European count suggest the world total may be higher. | Low |
| VC/PE overlap removed | −15% | −15% | −15% | Assumption: firms running both VC and PE strategies are counted in both categories. Not measured. | Low |
| Single family offices with public evidence of direct company investments | 2,008 (25% of 8,030) | 3,212 (40%) | 4,818 (60%) | Deloitte 8,030 SFOs; the shares that both invest directly and leave a public trace are assumptions. | Very low |
| **Observable organizations in scope** | **11,358** | **16,812** | **23,518** | (VC + PE) × 0.85 + family-office share | Low |

Multi-family offices, corporate venture units, and government investment vehicles are not separately counted; corporate VC and state-backed VC are assumed to be inside the VC figure, which may undercount them.

**Pilot check on directory coverage.** In the Czech pilot, the two directories listed 69 organizations. Of the 17 drawn by a fixed rule, 2 were eligible VC managers, 7 unresolved, and 8 not eligible. This implies roughly 11–38 eligible Czech VC managers among the 69 (about 5–52 with sampling error; docs/plan.md). Directories therefore over-list by a factor of about 2–6 relative to eligible managers, and they miss organizations that are not members or not listed. Neither effect has been measured outside Czechia.

## 4. Private individuals: context only

| Category | Published figure | Enumerable from public data? |
|---|---|---|
| Angel investors | 445,535 active in the US alone (2024, CVR estimate) | No. Only angels named in public deal announcements, angel-network member lists, or their own profiles are visible. The visible share is unknown and has not been measured. |
| Large private investors | 510,810 UHNW individuals worldwide (Altrata, mid-2025) | No. Wealth does not show investing activity. Those who invest through family offices or holding companies appear through those entities, which are counted above. |

A database could add a layer of publicly named individual investors discovered from deal announcements. Its size cannot be estimated defensibly from the sources found. It would need privacy review (public-interest basis, data minimization) before collection.

## 5. Scaling effort by workstream

The pilot did not time candidates or meter AI usage, so minutes per candidate are assumptions informed by the pilot workflow: each candidate needed official-site reading, a search for a dated deal, office and identity checks, and a human decision. The pilot reviewed 100% of candidates; the base case keeps 100% review on the first build.

| Workstream | Low | Base | High | Assumption |
|---|---|---|---|---|
| Candidates to process | 17,036 | 33,624 | 70,554 | Observable organizations × 1.5 / 2.0 / 3.0 for out-of-scope and duplicate directory entries (the Czech directories had 69 entries for an estimated 11–38 eligible managers) |
| Discovery: source onboarding (directories, associations, registries) | 800 h | 2,400 h | 8,000 h | 100 / 200 / 400 sources × 8 / 12 / 20 h each |
| Deduplication (manual part) | 284 h | 560 h | 1,176 h | 20% of candidates flagged × 5 min |
| Research and AI-assisted extraction, analyst-checked | 2,839 h | 11,208 h | 41,157 h | 10 / 20 / 35 min per candidate |
| Human verification and labelling | 2,839 h | 8,406 h | 29,398 h | 10 / 15 / 25 min per candidate, 100% review |
| Software (ingestion, schemas, validation, review UI) | 500 h | 1,000 h | 2,000 h | Engineering build, extending the pilot's validators |
| **Initial build total** | **7,263 h** | **23,574 h** | **81,730 h** | About 4 / 13 / 45 person-years at 1,800 h per year (assumption) |
| Maintenance per year | 1,420 h | 6,865 h | 35,277 h | Re-checking 25% / 35% / 50% of research and verification each year |

Lowering the review share after the first build (for example, reviewing all included records but only a sample of exclusions) would cut the verification line, but the pilot's sample is too small to show which share keeps precision acceptable.

## 6. Cost

Rate benchmarks (US Bureau of Labor Statistics, accessed 2026-10-26):

- Analyst rate A = USD 49.79 per hour: median pay of financial analysts, May 2025 ([BLS Occupational Outlook Handbook](https://www.bls.gov/ooh/business-and-financial/financial-analysts.htm)).
- Engineer rate E = USD 65.38 per hour: median annual wage of software developers, USD 135,980 in May 2025 ([BLS Occupational Outlook Handbook](https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm)), divided by 2,080 hours (assumption).

These are US median wages, not loaded employer costs or contractor rates, and are used only as benchmarks. Costs in other labour markets would differ; no cited rate for them was collected.

Formula:

    initial cost = k × (A × analyst hours + E × engineering hours) + AI/API cost + infrastructure
    analyst hours = discovery + deduplication + research + verification
    verification hours = candidates × review share × minutes per review / 60
    annual cost = k × A × maintenance hours + recurring AI/API and infrastructure

`k` is the employer overhead multiplier (benefits, management, tooling). It is left as a parameter because no public benchmark for it was collected.

| | Low | Base | High |
|---|---|---|---|
| Initial build, wage-only (k = 1) | USD 369,402 | USD 1,189,354 | USD 4,100,502 |
| Maintenance per year, wage-only (k = 1) | USD 70,686 | USD 341,803 | USD 1,756,442 |

AI/API and infrastructure costs are not included. The pilot ran inside Claude Code and ChatGPT sessions without metered API billing, so no per-candidate AI cost was measured. For a budget, use: candidates × tokens per candidate × price per token, with the provider's published price on the date of the estimate.

## 7. Overlap, deduplication, and coverage risks

- **Category overlap:** the same manager can run VC, growth, and PE funds; family offices also run VC arms. Counting by manager (the unit of record) avoids double counting only if aliases and successor firms are resolved, which the pilot showed is hard (Enern/KAYA, Lighthouse).
- **Fund versus manager:** directories list funds, managers, and advisers interchangeably (for example a Luxembourg fund with a Prague adviser in the pilot).
- **Geographic attribution:** multi-office managers need a principal-office decision; 6 of 20 pilot candidates had this issue (Credo, KAYA, Orbit, Enern, Sandberg, i&i).
- **Uneven disclosure:** family offices and private individuals disclose much less than VC managers; the pilot's disclosure rates (docs/plan.md) do not transfer to them.
- **Language and access:** many sources are not in English; some official sites failed TLS checks in the pilot and were not bypassed.
- **Stale figures:** several reference figures are undated or years old; all ranges should be refreshed before use.

## 8. Research needed to firm up the estimate

- A current worldwide VC and PE firm count with a stated definition (for example a methodology note from a data provider or association), and country counts for Asia.
- Invest Europe's own report text, to split its 1,750+ firms into VC and PE.
- The original CVR report and comparable angel estimates outside the US (for example EBAN for Europe).
- A timed, larger random pilot in a second country and a second category (for example German family offices) to measure minutes per candidate, unresolved share, and directory over-listing.
- Metered AI/API usage per candidate.
