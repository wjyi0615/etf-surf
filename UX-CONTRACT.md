# ETF Surf UX contract

## Business evidence

| Concern | Source | UI consequence |
|---|---|---|
| 탐색·비교 범위 | PROJECT.md, README.md | 등록된 20개 ETF, 비교 최대 3개; 전체 시장·성과 순위 아님 |
| 후보 선정·계산 | docs/rules.js, docs/data-core.js | 기존 규칙과 계산을 변경하지 않고 설명·수치로 표시 |
| 개인 정보·보존 | PROJECT.md, README.md | 로그인·서버 저장 없음. 설문 답변과 비교 선택은 메모리에만 유지 |
| 데이터 실패 | README.md, docs/update-status.js | 마지막 정상 자료 및 갱신 실패 표시, 자료가 없으면 복구·학습 링크 |
| 변경·삭제·결제·권한 | 해당 기능 없음 | 승인·CRUD·인증 계약 비적용 |

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Table Selection | docs/app.js toggleSelection/updateSelection/bar | 비교 최대 3개, README | 목록 체크박스 / 상세 버튼 / 비교 제외 | tests/surf.cjs + browser |
| Select/Listbox | docs/app.js filterSelect, native select | DESIGN.md | OS-owned popup, Korean option labels | browser keyboard/open popup |
| Form | docs/app.js validateForm | rules.js constraints + existing numeric input limits | 설문 필수 응답 / 금액 입력 | field error/browser tests |
| Scrollbar | docs/style.css global baseline | DESIGN.md | table/chart horizontal geometry | browser computed style |
| Toast | docs/app.js notify, index.html #toast | this contract | selection change / limit feedback | browser |

## Flow and state

- 탐색 필터(category/group/region/query)와 목록 보기(view)는 hash URL query로 저장한다. `/explore/<유형>` 기존 링크도 지원한다. 현재 URL을 새로고침하거나 뒤로가기해도 같은 결과가 나온다. 상품 상세에는 이전 탐색·가이드 조건으로 돌아가는 링크를 제공한다.
- 검색은 로컬 자료에 명시적인 찾기/Enter 제출을 사용한다. 한글 조합 Enter는 제출하지 않는다. 검색어가 있으면 지우기 버튼을 표시하고, 누르면 입력과 결과를 즉시 초기화한 뒤 입력으로 초점을 복구한다. 다른 필터는 유지한다.
- 20개 고정 카탈로그는 전체 표시한다. 무한 목록·서버 페이징은 없다. 향후 범위가 커지면 데이터 계약에 맞게 바꾼다. 결과 없음과 원본 자료 오류는 구분하며 각각 초기화/재시도를 제공한다.
- 비교 선택은 최대 3개. 네 번째 체크 시 실제 체크 상태를 되돌리고 제한 문구를 알린다. 선택·해제는 열어둔 설명과 입력을 유지한다. 비교 화면에서 제외하면 남은 제외 버튼 또는 빈 화면의 탐색 링크로 초점을 옮긴다.
- 비교 선택과 설문 답변은 URL·localStorage에 쓰지 않는다. 기존 개인정보·보존 정책에 따라 새로고침 시 초기화한다. 검색 조건만 공개적으로 공유 가능한 상품 탐색 상태다.
- 모든 폼은 novalidate. 설문 미응답은 그룹별 오류를 연결하고 첫 라디오로 초점을 이동한다. 금액은 기존 1,000~100,000,000원 및 1,000원 단위 제약을 따르며 인라인 오류와 aria-invalid/aria-describedby를 제공한다. 계산 실패 시 입력은 유지한다.
- 앱 이동은 제목·활성 메뉴·본문 초점을 갱신한다. 비교 선택은 화면 이동이 아니므로 전체 렌더를 하지 않는다. 스킵 링크는 hash 라우터의 경로를 바꾸지 않고 본문에 초점을 준다.
- 로딩·데이터 오류는 공용 자료 영역, 계산 자료 부족은 계산 결과 영역에 유지한다. 정적 자료만 사용하므로 검색의 비동기 경쟁·서버 저장·세션 만료·오프라인 저장 대기열은 비적용이다.

## Accessibility and verification

한국어 인터페이스, Asia/Seoul 시간 표기, native button/link/select/details/checkbox를 사용한다. 보이는 초점, 좁은 화면에서 페이지 전체 가로 넘침 방지, 폼 오류 연결, 글로벌 스크롤바, reduced-motion/forced-colors 경로를 유지한다. 비교·상세 차트의 가로 스크롤은 키보드 접근 가능하다.

정적 감사는 premium-ui.json의 소스와 명령을 사용한다. 실제 브라우저에서 검색·지우기·URL 복원·3개 한도·상세 설명 유지·오류 입력·네이티브 select·모바일을 별도로 확인한다. 계산 회귀는 기존 JavaScript 81개 설문 조합 및 Python 가격 갱신 테스트로 검증한다.
