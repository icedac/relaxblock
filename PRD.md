# Product Requirements Document (PRD) - RelaxBlock

## 1. 제품 개요 (Product Overview)

### 1.1 제품명
**RelaxBlock** - Digital Wellbeing Chrome Extension

### 1.2 제품 비전
사용자가 디지털 방해 요소를 효과적으로 관리하고, 생산성을 향상시키며, 건강한 온라인 습관을 형성할 수 있도록 돕는 Chrome 확장 프로그램

### 1.3 핵심 가치 제안
- **단순함**: 원클릭으로 웹사이트 차단
- **유연성**: 일시적으로 차단을 해제할 수 있는 "Relax Mode"
- **효과성**: 완전한 상호작용 차단으로 방해 요소 제거
- **프라이버시**: 모든 데이터는 로컬에만 저장

## 2. 목표 사용자 (Target Users)

### 2.1 주요 페르소나
1. **생산성 추구자**
   - 업무/학습 중 집중력 향상을 원하는 직장인/학생
   - SNS, 유튜브 등에 시간을 낭비하는 것을 줄이고 싶은 사용자

2. **디지털 웰빙 관심자**
   - 스크린 타임을 관리하고 싶은 사용자
   - 건강한 온라인 습관을 형성하고자 하는 사용자

3. **부모/교육자**
   - 자녀의 웹사이트 접근을 관리하고자 하는 부모
   - 학습 환경을 통제하고자 하는 교육자

### 2.2 사용 시나리오
- 업무 시간 중 소셜 미디어 차단
- 공부 시간 동안 엔터테인먼트 사이트 차단
- 휴식 시간에만 특정 사이트 일시적 허용
- 가족 구성원 간 차단 목록 공유

## 3. 핵심 기능 (Core Features)

### 3.1 도메인 차단 시스템
- **완전 차단**: 지정된 도메인에 대한 모든 상호작용 차단
- **시각적 피드백**: 차단된 사이트는 흑백 필터 적용
- **차단 메시지**: "This site is blocked" 오버레이 표시
- **미디어 차단**: 오디오/비디오 자동 정지 및 음소거

### 3.2 Relax Mode (휴식 모드)
- **일시적 차단 해제**: 5, 10, 15, 30, 60분 단위로 설정 가능
- **시각적 타이머**: 확장 프로그램 아이콘에 남은 시간 표시
- **자동 재차단**: 타이머 만료 시 자동으로 차단 재개
- **알림**: 타이머 만료 시 브라우저 알림

### 3.3 사용자 인터페이스
- **팝업 UI**: 현재 사이트 빠른 차단, Relax Mode 활성화
- **옵션 페이지**: 차단 도메인 목록 관리
- **Import/Export**: 차단 목록 JSON 형식으로 저장/불러오기

### 3.4 YouTube Shorts 차단 (별도 확장)
- YouTube Shorts 버튼 숨김
- Shorts 콘텐츠 피드에서 제거
- Shorts 상호작용 차단

## 4. 기술 사양 (Technical Specifications)

### 4.1 아키텍처
- **Manifest V3** 기반 Chrome Extension
- **컴포넌트**:
  - Background Service Worker: 중앙 제어 로직
  - Content Script: 페이지 내 차단 기능 구현
  - Popup/Options: 사용자 인터페이스
  - Enhanced Blocking CSS: 시각적 차단 효과

### 4.2 데이터 저장
- Chrome Local Storage API 사용
- 저장 데이터: 차단 도메인 목록, Relax Mode 타이머
- 외부 서버 통신 없음

### 4.3 성능 요구사항
- 페이지 로드 시 즉각적인 차단 적용
- 1초마다 도메인 체크 (실시간 모니터링)
- MutationObserver로 동적 콘텐츠 감시

## 5. 로드맵 (Roadmap)

### Phase 1: MVP (완료)
- [x] 기본 도메인 차단 기능
- [x] Relax Mode 구현
- [x] UI/UX 구현
- [x] Chrome Web Store 배포

### Phase 2: 향상된 차단 (현재)
- [x] iframe 지원
- [x] 실시간 모니터링 강화
- [x] YouTube Shorts 차단 확장
- [ ] 차단 통계 대시보드

### Phase 3: 고급 기능 (계획)
- [ ] 시간대별 자동 차단 스케줄
- [ ] 차단 카테고리 (SNS, 뉴스, 게임 등)
- [ ] 생산성 리포트
- [ ] 다중 프로필 지원

### Phase 4: 확장 (미래)
- [ ] Firefox 버전 개발
- [ ] 모바일 연동
- [ ] 팀/조직용 버전
- [ ] API 제공

## 6. 성공 지표 (Success Metrics)

### 6.1 사용자 지표
- 일일 활성 사용자 수 (DAU)
- 평균 차단 도메인 수
- Relax Mode 사용 빈도
- 사용자 유지율

### 6.2 기술 지표
- 페이지 로드 영향 < 50ms
- 메모리 사용량 < 50MB
- 크래시 발생률 < 0.1%

### 6.3 비즈니스 지표
- Chrome Web Store 평점 > 4.5
- 긍정적 리뷰 비율 > 90%
- 월간 신규 설치 수

## 7. 제약사항 및 가정 (Constraints & Assumptions)

### 7.1 제약사항
- Chrome Manifest V3 정책 준수
- 로컬 스토리지 용량 제한 (5MB)
- 크로스 오리진 제약

### 7.2 가정
- 사용자는 Chrome 기반 브라우저 사용
- 사용자는 기본적인 Chrome 확장 프로그램 사용법 이해
- 대부분의 차단 대상은 도메인 단위

## 8. 리스크 및 완화 방안 (Risks & Mitigation)

### 8.1 기술적 리스크
- **리스크**: Chrome API 변경
- **완화**: 정기적인 API 업데이트 모니터링

### 8.2 사용자 경험 리스크
- **리스크**: 과도한 차단으로 인한 불편
- **완화**: Relax Mode 제공, 쉬운 차단 해제

### 8.3 보안 리스크
- **리스크**: 차단 우회 시도
- **완화**: 다층 차단 메커니즘, 실시간 모니터링

## 9. 부록 (Appendix)

### 9.1 용어 정의
- **차단 도메인**: 사용자가 접근을 제한한 웹사이트 도메인
- **Relax Mode**: 일시적으로 차단을 해제하는 기능
- **Enhanced Blocking**: iframe 및 동적 콘텐츠까지 차단하는 강화된 차단 기능

### 9.2 참고 자료
- Chrome Extension Manifest V3 문서
- Web Content Blocking Best Practices
- Digital Wellbeing Research Papers