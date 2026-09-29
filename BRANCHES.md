# 브랜치 정리 기록

2026-09-29: 전체 로컬·원격 브랜치를 확인한 뒤 통합본을 main에 fast-forward로 반영했습니다.

- 로컬 이전 작업 브랜치 26개 정리. 현재 main과 codex/catalog-ui-consolidation만 유지합니다.
- 원격 codex/etf-surf-ux, codex/surf-etf-directory, codex/surf-phase3 삭제.
- 중복 기능은 재병합하지 않았으며, 사용자가 보류한 바구니 화면도 복원하지 않았습니다.
- 다른 worktree에서 사용 중인 로컬 main은 강제 변경하지 않았습니다. 공개 기준은 origin/main입니다.
- 이전 끝 커밋은 아래 태그로 복구할 수 있습니다. 일부 태그는 GitHub workflow 권한 제한으로 로컬에만 남습니다.

| 보관 태그 | 커밋 | 보관 위치 |
|---|---|---|
| `archive/2026-09-29/backup-before-sync` | `e3788b9` | 로컬·원격 |
| `archive/2026-09-29/codex/all-etf-composition` | `d89363a` | 로컬·원격 |
| `archive/2026-09-29/codex/catalog-without-prices` | `ebeea32` | 로컬·원격 |
| `archive/2026-09-29/codex/data-freshness` | `7314d45` | 로컬 |
| `archive/2026-09-29/codex/data-status-entry` | `9c63438` | 로컬 |
| `archive/2026-09-29/codex/data-status-navigation` | `ddc818c` | 로컬 |
| `archive/2026-09-29/codex/detail-reading-flow` | `848fc0d` | 로컬·원격 |
| `archive/2026-09-29/codex/discovery-category-steps` | `a0b1c3e` | 로컬·원격 |
| `archive/2026-09-29/codex/etf-catalog-import` | `1ca9884` | 로컬·원격 |
| `archive/2026-09-29/codex/etf-surf-ux` | `6f38aa9` | 로컬·원격 |
| `archive/2026-09-29/codex/information-only` | `b1e92d5` | 로컬·원격 |
| `archive/2026-09-29/codex/initial-setup` | `76f6ec6` | 로컬·원격 |
| `archive/2026-09-29/codex/krx-source-review` | `0eb4253` | 로컬·원격 |
| `archive/2026-09-29/codex/multi-source-catalog` | `27164dc` | 로컬·원격 |
| `archive/2026-09-29/codex/peer-differences` | `5acda51` | 로컬·원격 |
| `archive/2026-09-29/codex/release-site` | `115bb4f` | 로컬·원격 |
| `archive/2026-09-29/codex/representative-etf-shortlist` | `baa1d5a` | 로컬·원격 |
| `archive/2026-09-29/codex/soft-blue-theme` | `23ab48a` | 로컬·원격 |
| `archive/2026-09-29/codex/surf-beginner-flow` | `9d556f3` | 로컬 |
| `archive/2026-09-29/codex/surf-data-updates` | `186b790` | 로컬 |
| `archive/2026-09-29/codex/surf-detail-guide` | `9da3b4b` | 로컬 |
| `archive/2026-09-29/codex/surf-etf-directory` | `00c823c` | 로컬·원격 |
| `archive/2026-09-29/codex/surf-mvp` | `d90c03e` | 로컬·원격 |
| `archive/2026-09-29/codex/surf-pages-deploy` | `cec68fd` | 로컬 |
| `archive/2026-09-29/codex/surf-without-basket` | `57d5795` | 로컬·원격 |
| `archive/2026-09-29/codex/topic-discovery` | `af87585` | 로컬·원격 |
| `archive/2026-09-29/remote-surf-phase3` | `745aeb1` | 로컬·원격 |

## 복구 예시

```sh
git switch -c codex/soft-blue-theme archive/2026-09-29/codex/soft-blue-theme
```
