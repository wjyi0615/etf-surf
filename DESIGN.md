---
version: alpha
name: ETF Surf
description: 입문자가 ETF의 구조와 차이를 읽으며 탐색하는 청록색 학습 도구
colors:
  primary: "#164b53"
  ink: "#173d44"
  muted: "#586e71"
  paper: "#f7f8f3"
  surface: "#ffffff"
  soft: "#eaf1ee"
  line: "#d9e3df"
  green: "#dff4b6"
  focus: "#a4530c"
  warning-ink: "#70501e"
  warning-bg: "#fff3df"
typography:
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif'
  data:
    fontFamily: '"SFMono-Regular", Consolas, monospace'
rounded:
  panel: "16px"
  control: "10px"
spacing:
  content-max: "1176px"
  mobile-inset: "16px"
  section: "32px"
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# ETF Surf Design System

## Overview

입문자를 위한 ETF 탐색·학습·비교 앱이다. 제품 근거는 PROJECT.md 및 README.md, 규칙은 docs/rules.js와 docs/data-core.js다. 기존 파도 로고, 청록과 연두, 밝은 바탕을 유지한다. 홈의 바다 그림만 브랜드 표현을 맡고, 제품 화면에서는 검색·설명·비교 작업을 우선한다. 거래 터미널의 긴장감이나 추천 순위 대시보드처럼 보이지 않게 한다.

한국어·한국시간 기준이며 한국어 글꼴의 자연스러운 줄바꿈을 보장한다. 새 글꼴 다운로드나 라이브러리가 없다. 행동 계약은 UX-CONTRACT.md가 소유한다.

## Colors

기존 런타임 정본을 유지하는 Model B다. `docs/style.css :root → 공용 선택자 → 화면`으로 소비한다. 위 색상은 같은 이름의 CSS 변수에 대응하며 primary만 기존 --teal에 대응한다. 배경은 --paper, 패널은 --surface, 선택은 --teal/--green이다. 경고는 --warning-ink/--warning-bg와 설명 문구를 같이 사용한다. 초점은 --focus다. 스크롤바는 --scroll-thumb #8aa19b, --scroll-hover #586e71, --scroll-active #164b53, 트랙 --soft를 사용한다. 색상 변경 시 이 문서와 CSS를 함께 고친다.

## Typography

body→--font-body, data→--font-data. 본문은 한국어 시스템 고딕, 목록 숫자는 고정폭 글꼴이다. 앱 제목은 30–42px, 홈 제목은 40–60px로 구분한다. 세부 설명은 13–15px이며 숫자는 tabular-nums를 유지한다. 작은 화면에서 제목을 한 글자씩 쪼개지 않는다.

## Layout

최대 본문 너비 1176px, 모바일 좌우 16px. 760px 이하에서 목록을 카드로, 투자 방식 표를 세로 읽기 형태로 전환한다. 비교 데이터 표와 차트만 자체 가로 스크롤을 소유한다. 본문과 긴 폼은 자연스러운 문서 스크롤을 유지한다. 필터는 흰 패널로 묶고 그 아래 비교 선택 요약과 결과 수를 배치한다. 비교 요약은 선택이 0개여도 공간을 유지한다.

## Elevation & Depth

제품 화면은 배경과 얇은 테두리로 구분하며 장식 그림자를 추가하지 않는다. 홈의 기존 서핑 티켓 그림자만 유지한다. 선택한 비교 목록은 청록 바탕으로 강조한다.

## Shapes

panel→--radius-panel 16px, control→--radius-control 10px. 기존 둥근 형태를 유지한다. 유형 바로가기만 둥근 칩이며 상태 배지는 누르는 것처럼 표현하지 않는다.

## Components

버튼과 링크는 hover·active·focus를 제공한다. 클릭 대상 높이는 최소 44px이며 비활성 버튼은 동작하지 않는다. 네이티브 select의 운영체제 팝업을 허용하고 커스텀 팝업처럼 보이게 강제하지 않는다. 검색어 지우기는 별도 버튼이며 폼 안에서도 submit하지 않는다.

토스트는 기존 공용 #toast, 필드 오류는 .field-error, 자료 상태는 notice(), 목록은 catalogTable(), 비교 선택은 updateSelection()을 재사용한다. 오류는 토스트만으로 전달하지 않는다. 공유 선택 버튼을 눌러도 설명 펼침 상태나 폼 입력을 잃지 않는다.

버튼 배경 전환은 120ms이고 reduced-motion에서는 생략한다. forced-colors에서는 시스템 스크롤바와 선택 윤곽선을 사용한다. 차트는 색상에 선 패턴을 더하며 수치 대안을 비교표에 제공한다.

## Do's and Don'ts

- 자료 기준일과 미확보 상태, 기존 위험 설명을 유지한다.
- 상세 설명을 읽는 중 비교 선택으로 화면 전체를 다시 그리지 않는다.
- 원래의 청록·파도 정체성을 보존하고 금융 주문 화면으로 바꾸지 않는다.
- 총수익률·성과 순위·개인별 투자 적합성을 새로 추론하지 않는다.
