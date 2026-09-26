# ETF Surf UI verification

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
