# 브랜치 정리 기록

2026-09-29 기준. 통합 작업본은 `codex/catalog-ui-consolidation`입니다. 최신 `origin/main`의 가격 갱신만 작업본에 병합했습니다. main 병합·공개 배포·원격 브랜치 삭제는 하지 않았습니다.

## 정리한 로컬 브랜치

모두 통합 작업본의 조상임을 확인했습니다. 각 끝 커밋에 로컬 보관 태그를 남겼습니다.

| 브랜치 | 끝 커밋 | 복구 태그 |
|---|---|---|
| `codex/all-etf-composition` | `d89363af` | `archive/2026-09-29/codex/all-etf-composition` |
| `codex/catalog-without-prices` | `ebeea324` | `archive/2026-09-29/codex/catalog-without-prices` |
| `codex/data-freshness` | `7314d451` | `archive/2026-09-29/codex/data-freshness` |
| `codex/data-status-entry` | `9c634381` | `archive/2026-09-29/codex/data-status-entry` |
| `codex/data-status-navigation` | `ddc818cc` | `archive/2026-09-29/codex/data-status-navigation` |
| `codex/detail-reading-flow` | `848fc0d6` | `archive/2026-09-29/codex/detail-reading-flow` |
| `codex/discovery-category-steps` | `a0b1c3ea` | `archive/2026-09-29/codex/discovery-category-steps` |
| `codex/etf-catalog-import` | `1ca98849` | `archive/2026-09-29/codex/etf-catalog-import` |
| `codex/etf-surf-ux` | `6f38aa9a` | `archive/2026-09-29/codex/etf-surf-ux` |
| `codex/information-only` | `b1e92d56` | `archive/2026-09-29/codex/information-only` |
| `codex/krx-source-review` | `0eb4253a` | `archive/2026-09-29/codex/krx-source-review` |
| `codex/multi-source-catalog` | `27164dc7` | `archive/2026-09-29/codex/multi-source-catalog` |
| `codex/peer-differences` | `5acda515` | `archive/2026-09-29/codex/peer-differences` |
| `codex/release-site` | `115bb4fc` | `archive/2026-09-29/codex/release-site` |
| `codex/representative-etf-shortlist` | `baa1d5a4` | `archive/2026-09-29/codex/representative-etf-shortlist` |
| `codex/soft-blue-theme` | `23ab48a4` | `archive/2026-09-29/codex/soft-blue-theme` |
| `codex/surf-etf-directory` | `00c823cd` | `archive/2026-09-29/codex/surf-etf-directory` |
| `codex/topic-discovery` | `af87585e` | `archive/2026-09-29/codex/topic-discovery` |

## 보존한 브랜치

- `backup-before-sync`
- `codex/catalog-ui-consolidation`
- `codex/initial-setup`
- `codex/surf-beginner-flow`
- `codex/surf-data-updates`
- `codex/surf-detail-guide`
- `codex/surf-mvp`
- `codex/surf-pages-deploy`
- `codex/surf-without-basket`
- `main`

별도 이력의 기존 브랜치와 백업은 내용 유실을 피하기 위해 보존했습니다. 다른 worktree에서 사용 중인 main도 변경하지 않았습니다.

## 복구

```sh
git switch -c codex/soft-blue-theme archive/2026-09-29/codex/soft-blue-theme
```

보관 태그는 로컬에만 있습니다. 원격에 남은 이전 브랜치는 별도 삭제하지 않았습니다.

## main 배포 정리 · 2026-09-29

전체 로컬·원격 브랜치를 다시 확인했습니다. 초기화·이름 변경은 현재 파일로 대체됐으며 가격 갱신·상세·초보자 흐름 변경은 현재 기능에 통합돼 있습니다. surf-phase3 및 surf-mvp의 바구니 화면은 사용자가 보류한 기능으로 재병합하지 않습니다. 남은 옛 브랜치도 복구 태그로 보존한 뒤 삭제합니다. 통합본은 최신 origin/main을 포함하며 fast-forward로 공개 main에 반영합니다. 다른 worktree의 로컬 main은 사용 중이므로 강제 변경하지 않습니다.
