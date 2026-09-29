# ETF Surf UI verification

## Data freshness — 2026-09-27

- Shared browser/CLI policy: 140 manual fields across 20 funds. Report: 31 recheck, 26 recorded, 75 unavailable, 8 date checks. These are snapshot maintenance findings, not refreshed source values.
- JS regression plus freshness boundaries, invalid/future dates, missing sources and nonmutation tests pass. Browser inspected product-specific report and mobile 390px without document overflow.
- Workflow report/artifact steps authored but not executed on GitHub; no deployment. Existing price update behavior preserved.

## Peer differences — 2026-09-27

- Branch `codex/peer-differences`: same-index pairs reuse peers(), fundamental(), and official composition snapshots. No policy inferred from names or payment events. Unverified hedge/distribution/additional-cost fields explicitly unavailable.
- JS regression and all peer-pair rendering checks pass; syntax and whitespace checks pass. Desktop 1280px KODEX/TIGER 200 table inspected. Mobile 390px document has no horizontal overflow; the table owns horizontal scrolling. No data changes or deployment.

## Detail reading flow — 2026-09-27

- `codex/detail-reading-flow`: all 20 existing products use visible target → drivers → risk, followed by composition evidence. Existing text, sources and dates retained; repeated composition explanation removed.
- JS suite, Python five tests, syntax and whitespace checks pass. Strict audit retains the same three delegated-button false positives.
- Real browser: gold-futures detail checked at 1280px and 390px; no mobile horizontal overflow. Keyboard Enter expands the checklist with visible focus; comparison selection preserves it. Local preview only, no deployment.

## Topic discovery update — 2026-09-27

- Base: origin/main `18aeeb1`, local branch `codex/topic-discovery`; no merge or deployment.
- Home: six topic links, verified 1280px three columns, 820px two columns, 390px one column. Tablet/mobile document has no horizontal overflow.
- Guide: home selection is retained; stock has nine products and three subtypes; dividend has four products; CD/KOFR each resolve to one existing product. Basic/returns switching retains the CD product after fixing the shared view handler's subtype predicate.
- Browser: reload restores committed subtype; detail return and browser back/forward restore guide conditions. Open risk disclosure and unapplied market input survive comparison selection (observed open=1, market=us, selected=1). Keyboard Enter opens the home topic and Tab gives the market select a visible solid focus outline.
- Existing JS regression suite and new topic/count/legacy-link/empty/detail-return cases pass. Python's five update tests pass; JS syntax and diff whitespace checks pass.
- Premium strict audit still reports the same three pre-existing delegated-button false positives; this is not a clean audit. Updated raw report retained. No raw data, recommendation rules or performance calculations changed.

Verified locally on 2026-09-26. No production deployment was performed.

## Automated checks

- `node tests/surf.cjs`: passed. Existing 81 questionnaire combinations, candidate rules, all 20 details, calculations, holdings, filters; additional URL restoration, invalid parameters, guide view persistence, and selection limit/in-place update checks.
- `python3 -m unittest discover -s tests -p 'test_*.py' -v`: all 5 tests passed, including expected offline failure and recovery.
- `node --check docs/app.js`: passed.
- `git diff --check`: passed.
- DESIGN.md lint: 0 errors; 8 advisory warnings for prose-mapped tokens without component frontmatter references.
- Premium strict static audit: executed, but exits 1 for three `affordance.actionless-button` findings. These are false positives on existing data-peer/data-select buttons using the shared main click handler. Result peer comparison and comparison removal were exercised in the real browser; action wiring was retained rather than replaced with inline handlers to satisfy a syntax-only check. The raw report is preserved in premium-audit.json. This is not a clean static-audit result.

## Browser coverage

- Desktop exploration: KODEX search returns 10 products; reload restores query; explicit clear returns all 20 and focuses the search field.
- Three selected products remain checked; clicking a fourth rolls that checkbox back and announces the limit.
- Comparison removal leaves focus on the next available removal control.
- Questionnaire empty submission associates four field errors and focuses the first radio. A valid complete answer reaches the expected candidate result.
- Scenario amount 500 produces an inline error; 100000 calculates a 12-payment result. Comparison selection does not collapse the expanded scenario or clear its input.
- Result peer action opens the expected two-fund comparison.
- Guide view selection persists through detail navigation and the explicit return link.
- 390px guide: investment-style content stacks vertically; expanded descriptions remain legible. 320px exploration: document scrollWidth equals clientWidth, with independent table/chart overflow where applicable.
- Global scrollbar colors are present in computed styles. Native selects retain platform-owned behavior and localized options; this does not promise identical OS popup geometry.
- Missing-price fixture: persistent error, enabled retry, retry remains available on continued failure, learning remains usable. Fixture removed after testing.
- Browser console showed no application errors during the observed normal flows.

## Limits

The browser checks use the available in-app browser, not a full Safari/Firefox/Android matrix. Reduced-motion and forced-colors paths were checked in source; no emulated high-contrast or screen-reader certification is claimed. Recommendation rules, dataset files and pricing calculations are unchanged. No new persistence of questionnaire answers or comparison selection was introduced.

## Description catalog · 2026-09-28

- 34 products render: 20 existing priced products and 14 description-only entries. All 14 detail routes and mixed-price comparison are covered by regression tests.
- Actual in-app browser: Japanese filter returns one ETF; detail shows source date, check date, stale notice and missing-price status. At 390px document width and scroll width both equal 390px; screenshot reviewed.
- At 1280px, both Kosdaq ETFs can be selected and compared; missing prices suppress chart and shared-period metrics. Comparison removal button works. No observed browser console errors. Temporary viewport override reset; exploration preview left open.
- JavaScript regression suite and Python 8-test suite pass. Strict premium audit retains three pre-existing delegated-button false positives (data-peer/data-select); handlers are delegated, not inline. Comparison removal verified in browser; peer logic covered by regression tests. Static audit is not reported as fully passing.

## All registered composition evidence · 2026-09-29

- 32 registered ETFs after Japan/Europe removal; regression tests verify all 32 source links/dates, 27 partial holdings lists and 5 explicitly labelled structure descriptions. No prices or performance series changed.
- In-app browser at 390px and 1280px: TIGER Kosdaq150 renders 10 dated composition items and percentages; stale-data notice visible. Mobile document width equals scroll width (390px). Screenshots inspected.
- Versioned changed data scripts to avoid stale browser snapshots. Reset temporary viewport after verification.
- Structure-only products do not imply complete/current holdings. CD source has maturity/date inconsistencies; numerical composition deliberately withheld.
