# Argos 요구사항 관리

## update : 230116

### 스캔 api 메타데이터 파싱 작업 추가 : `취소` `우선`
<br>

### 데이터 획득 완료 APi 추가 : `작업중`
<br>

### 프로젝트 진행상태 가시화 작업 추가 : `작업중`
<br>

-----

### 대시보드 홈 : `완료`
  - 로그인시 첫 화면은 대시보드로 이동
  - 통계 종류 및 필요 데이터 연구 필요(수요처 요구사항 포함)

<br>

### 프로젝트 조회화면 
  - 프로젝트 조회 화면 내부에 조회/등록/수정/삭제 버튼을 구현하여 통합
  - 등록 : `완료` / 삭제 : `완료 : 220930`
  - 프로젝트 등록시 데이터 획득 지역의 시도/시군구까지 사용자가 선택하여 생성 : `완료`
  - 조회 항목 : 지역명/프로젝트명/프로젝트번호/차량/센서/담당자/날짜 : `완료`

<br>

### 지도조회 
  - 해당 프로젝트 선택 후 경로 보기 클릭 시 지도화면에 촬영 경로 가시화 : `작업중`


### 데이터 조회 
  - 데이터 디텍팅 결과 조회 / 데이터 갱신 결과 조회로 구분
  - 조회 항목 : 지역명/프로젝트명/전체영상 수 /디텍팅 영상 수 - `완료`
  - 객체 위치 : 해당 프로젝트 선택 후 지도보기 클릭 시 지도화면에 포인트 형태 객체 가시화
  - 포인트 클릭 시 해당 영상과 디텍팅 결과 팝업 가시화 - `완료(임시)`
  - 영상데이터 조회 에서 검색 조건이 소문자, 대문자를 구분하는데 구분없이 검색 되게 변경 - `완료 : 220930`

### 갱신 결과 조회 : 데이터 갱신 처리 결과 조회 - `협의 필요`
  - 조회 항목 : 지역명/프로젝트명/전체 디텍팅 수/갱신필요 객체수/갱신 완료 수 - `작업중`
  - 지도조회 : 해당 프로젝트 선택 후 지도보기 클릭 시 지도화면에 갱신 객체 포인트 가시화 - `작업중`
  - 포인트 클릭 시 해당 영상과 디텍팅 결과 팝업 가시화 - `작업중`
  - 도로대장 기존 위치 포인트 동시 가시화(위치 및 속성 비교) - `??`
  - 도로대장 데이터를 갱신하는 것이 아니고, 본 시스템으로 기 구축한 데
이터가 있으면 비교하여 갱신 (22.07.15 회의록)



