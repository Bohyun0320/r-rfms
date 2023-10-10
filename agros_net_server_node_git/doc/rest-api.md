## Argos Net REST-API

### API 연계 시퀀스
<br>

<!-- ![sequence diagram](/public/images/API_Sequence_230130.drawio.png) -->
<img src="/public/images/API_Sequence_230203.drawio.png" width="900" margin-left="100">

<br>

----

### ***1. 액세스 토큰 요청***  
REST API 요청을 위한 access token을 발급 받습니다.
#### Request URL
```http
POST /api/auth/token HTTP/1.1
Host: dtgeo.iptime.org:3001
```
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|id         |String     |사용자 ID                  |Y|
|password   |String     |비밀번호                   |Y|
#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |String |성공여부 |Y|
|msg |String |처리 메시지 |N|
|token |String |액세스 토큰 |N|

<details>
<summary>Sample Requst</summary>

```BASH
curl --request POST --url http://dtgeo.iptime.org:3001/api/auth/token --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data id=test@test.com --data 'password=rudgns18!'
```
</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 291
ETag: W/"123-9RHmnk/f/v5XOIGU0JiAUhHlYzY"
Date: Fri, 01 Apr 2022 15:19:23 GMT
Connection: close

{
  "success": true,
  "msg": "success!",
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJfdHlfaWQiOjMsInN0dHVzX3R5X2lkIjoxLCJpYXQiOjE2NDg4MjYzNjMsImV4cCI6MTY2MzIyNjM2M30.W4WyTaq9YE6O0carYTb8Aq8ycCIR9-_r4pDnJog4bl177xGZylQ6fU4jM-O5ogyk1IHrpiZRp0QzlkEEvH3BBg"
}
```
</details>
<br>

-------

### ***2. 장비 리스트 요청하기***
프로젝트 생성에 필요한 차량정보 카메라·라이다 센서의 정보를 요청 합니다.
```http
GET /api/equip/list HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
없음

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |String |성공여부 |Y|
|msg |String |처리 메시지 |N|
|vhList |Array(JSON) |차량 정보 |N|
|vhList.vh_id |Integer |차량 ID |Y|
|vhList.vh_nm |String |차량명 |Y|
|vhList.vh_no |String |차량 번호 |Y|
|sensList |Array(JSON) |센서 정보 |N|
|sensList.sens_id |Integer |센서 ID |Y|
|sensList.vh_id |Integer |장착 차량 ID |Y|
|sensList.sens_ty |Integer |센서 타입 (1.라이다 / 2.카메라) |Y|
|sensList.sens_nm |String |센서명 |Y|
|sensList.sens_no |String |센서 번호 |Y|

<details>
<summary>Sample Requst</summary>

```bash
curl --request GET --url http://dtgeo.iptime.org:3001/api/equip/list --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJfdHlfaWQiOjMsInN0dHVzX3R5X2lkIjoxLCJpYXQiOjE2NDg1MzIzNjAsImV4cCI6MTY2MjkzMjM2MH0.UWfrgGBTihX0YJzq4ctInamOQv-BDK-6ihH_w3lsVP7XcFitMIcqfDSTQw7AjT7CkPTycfjE7N83S7-wVrWT-A}' --header 'content-type: application/json; charset=UTF-8' --header 'user-agent: vscode-restclient'
```
</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2350
ETag: W/"92e-IlddIAGccpQ5buWtw8YAnhZK8is"
Date: Fri, 01 Apr 2022 15:29:12 GMT
Connection: close

{
  "success": true,
  "msg": "get equipList success",
  "vhList": [
    {
      "vh_id": 4,
      "vh_nm": "테스트차량2",
      "vh_no": "4324"
    },
    {
      "vh_id": 6,
      "vh_nm": "업로드 테스트",
      "vh_no": "6513"
    },
    .
    .
    .
    {
      "vh_id": 9,
      "vh_nm": "카니발",
      "vh_no": "21312312"
    }
  ],
  "sensList": [
    {
      "sens_id": 1,
      "sv_user_id": "test@test.com",
      "vh_id": 5,
      "mng_sgg": 228,
      "sens_ty": 1,
      "sens_nm": "테스트 센서",
      "sens_no": "213124",
      "reg_ymd": "2022-02-28T15:00:00.000Z",
      "cond_cd": 1,
      "sens_memo_cn": "",
      "sens_img_file_path": null
    },
   .
   . 
   .
    {
      "sens_id": 4,
      "sv_user_id": "test@test.com",
      "vh_id": 4,
      "mng_sgg": 189,
      "sens_ty": 2,
      "sens_nm": "test",
      "sens_no": "5322",
      "reg_ymd": "2022-03-03T15:00:00.000Z",
      "cond_cd": 1,
      "sens_memo_cn": "",
      "sens_img_file_path": "/equip/1646384699821.jpg"
    }
  ]
}

```
</details>

<br>

-------
### ***3. 프로젝트 생성***
데이터 단위 프로젝트를 생성한다.
(프로젝트 ID는 자동 생성)

#### Request URL
```http
POST /api/project/add HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|name |String |프로젝트 명 |Y|
|prjno |String |프로젝트 번호 |Y|
|vhid |Integer |차량 ID |Y|
|camsensid |Integer |카메라 센서 ID (미선택 : -1)|Y|
|lidarsensid |Integer |라이다 센서 ID (미선택 : -1)|Y|
|memo |String |프로젝트 메모 |Y|
|pnucd |String |PNU 코드 (예 : '11010' - 서울시 종로구) |Y|
|weathercd |Integer |날씨 코드 (1 : 맑음 / 2 : 흐림 / 3 : 우천 / 4 : 눈) |N|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |msg |요청에 대한 응답 메시지 |Y|
|data |JSON |생성된 프로젝트 정보 |Y|
|data.prj_id |Integer |생성된 프로젝트 ID |Y|
|data.prj_nm |String |생성된 프로젝트 명 |Y|
|data.vh_id |Integer |생성된 프로젝트 차량 ID |Y|
|data.sv_user_id |String |생성된 프로젝트 담당자 ID |Y|
|data.prj_memo_cn |String |생성된 프로젝트 메모 |Y|
|data.prj_no |String |생성된 프로젝트 번호 |Y|
|data.prj_crt_dt |String |프로젝트 생성 일시 |Y|
|data.cam_sens_id |Integer |생성된 프로젝트 카메라 센서 ID |Y|
|data.lidar_sens_id |Integer |생성된 프로젝트 라이다 센서 ID |Y|
|data.pnu_cd |String |생성된 프로젝트 PNU Code |Y|
|data.weather_cd |Integer |생성된 프로젝트 날씨 코드 (1 / 2 / 3 / 4) |Y|
|data.path |String |프로젝트 저장공간 경로 |Y|

<details>
<summary>Sample Requst</summary>

```bash
curl --request POST --url http://localhost:3001/api/project/add --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5X2lkIjoxMCwic3R0dXNfdHlfaWQiOjEsImlhdCI6MTY1MjY5NTgwMSwiZXhwIjoxNjY3MDk1ODAxfQ.hauz3v17oKYPFcArZ2FwEtvNY7HOG5y6HoouStPFB4zdpWnCtrHaMYxj9yUa-gwTgV9KTI08Isfk5Rr77UeD2Q}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data 'name=REST API 프로젝트031' --data prjno=test-api-031 --data vhid=4 --data camsensid=3 --data lidarsensid=1 --data 'memo=가나다라마바사' --data pnucd=11010 --data weathercd=2
```
</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 468
ETag: W/"1d4-V1UV4CIt9PFDwaMv91hWiCgrAHo"
Date: Mon, 30 May 2022 05:34:48 GMT
Connection: close

{
  "success": true,
  "msg": "프로젝트 정보가 저장 되었습니다.",
  "data": {
    "prj_id": 112,
    "prj_nm": "REST API 프로젝트031",
    "vh_id": 4,
    "sv_user_id": "admin@test.com",
    "prj_memo_cn": "가나다라마바사",
    "prj_no": "test-api-031",
    "prj_crt_dt": "2022-05-30T05:34:41.733Z",
    "prcs_strt_dt": null,
    "prcs_end_dt": null,
    "cam_sens_id": 3,
    "lidar_sens_id": 1,
    "pnu_cd": "11010",
    "prj_stts_cd": 1,
    "weather_cd": 2,
    "data_clct_dt": null,
    "path": "d:\\dev\\argos_net\\storage\\static\\data\\112"
  }
}
```
</details>
<br>

---

### ***4. 데이터 획득***  `(No API)`
- 촬영장비에서 영상 / 점군데이터 획득 / 메타데이터 생성

<br>

---

### ***5. 데이터 업로드*** `(No API)`
정해진 경로의 FTP에 획득한 영상 데이터 업로드 


```bash
# 프로젝트 데이터 경로
base path - ftp://dtgeo.iptime.org/dynamic/argos_net_storage/data

..
└── data                # data 저장공간
    └── 32              # 프로젝트 저장공간 (프로젝트 생성시 프로젝트 ID가 디렉토리명)
        ├── cam_file    # 영상파일 저장위치   
        ├── lidar_file  # las 파일 저장위치
        └── meta_file   # 메타정보 파일 저장위치
```

<br>

----

### ***6. 메타데이터 전달***
FTP에 업로드된 영상데이터의 메타데이터 전달

#### Request URL
```http
POST /api/data/meta
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 

#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjId |Integer |프로젝트 ID |Y|
|fileNm |String |영상데이터 파일명 |Y|
|time |String |영상데이터 획득시간 |Y|
|lat |String |위도 |Y|
|lon |String |위도 |Y|
|x |String |UTM X좌표 |Y|
|y |String |UTM Y좌표 |Y|
|z |String |UTM Z좌표 (고도) |Y|
|roll |String |자세 (roll) |Y|
|pitch |String |자세 (pitch) |Y|
|yaw |String |자세 (yaw) |Y|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |JSON |db 업데이트 데이터 |Y|

<details>
<summary>Sample Requst</summary>

```bash
curl --request POST --url http://localhost:3001/api/data/meta --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5X2lkIjoxMCwic3R0dXNfdHlfaWQiOjEsImlhdCI6MTY3NTI0MDQ4MywiZXhwIjoxNjg5NjQwNDgzfQ.cuGTKsDBjRGrh2Lq8GrqT6vRvM1BFr-huVs3iU19JSKPAz9fDswBEvB5FNMT04k6LVR6VIMJ3bJcuUCpKPfvLA}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data prjid=130 --data 'fileNm=im[000001].jpg' --data time=2023011909335.1616480350 --data lat=37.5649623258 --data lon=126.8479051269 --data x=0.0000000000 --data y=309929.5123289478 --data z=33.8721530343 --data roll=1.5516554667 --data pitch=1.1735334614 --data yaw=302.3434448242
```

</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 561
ETag: W/"231-T8SbqYK6654/OoIDQGai8dQ20dM"
Date: Mon, 13 Feb 2023 07:13:19 GMT
Connection: close

{
  "success": true,
  "msg": "db insert succeed",
  "data": {
    "photo_id": 1727,
    "data_file_path": "..\\storage\\static\\data\\130\\cam_file\\im[000001].jpg",
    "file_len": "188753",
    "prj_id": 130,
    "data_reg_ty_id": 3,
    "org_file_nm": "im[000001].jpg",
    "prcs_strt_dt": null,
    "prcs_end_dt": null,
    "data_reg_dt": "2023-02-13T07:13:19.135Z",
    "prcs_yn": null,
    "latitude": "37.5649623258",
    "longtitude": "126.8479051269",
    "altitude": "33.8721530343",
    "utm_x": "0.0000000000",
    "utm_y": "309929.5123289478",
    "pitch": "1.1735334614",
    "roll": "1.5516554667",
    "yaw": "302.3434448242",
    "time_dt": "2023-01-19T00:33:05.161Z"
  }
}

```

</details>


<br>

---

### ***7. 촬영 종료*** `(No API)`
데이터 획득을 마친다.

<br>

-----

### ***8. 메타/점군 데이터 업로드*** `(No API)`
정해진 경로의 FTP에 획득한 메타데이터와 점군데이터 업로드

<details> 
  <summary>데이터 경로</summary>

  ```bash
# 프로젝트 데이터 경로
base path - ftp://dtgeo.iptime.org/dynamic/argos_net_storage/data

..
└── data                # data 저장공간
    └── 32              # 프로젝트 저장공간 (프로젝트 생성시 프로젝트 ID가 디렉토리명)
        ├── cam_file    # 영상파일 저장위치   
        ├── lidar_file  # las 파일 저장위치
        └── meta_file   # 메타정보 파일 저장위치
```

</details>

<br>

-----

### ***9. 데이터 획득 완료 알림*** 
데이터 획득 완료 를 통보한다.

> 프로젝트의 진행상태를 데이터 `획득완료` 상태로 변경하고,  
> 프로젝트의 점군데이터와 메타데이터 경로를 확인하여  
> 업로드된 데이터를 DB에 업데이트 한다.  


<br>

#### Request URL
```http
GET /api/data/finish HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjId |Integer |프로젝트 ID |Y|
|use |String |데이터 활용여부 (활용 : y, 미활용 : n, default : y) |N|


#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |JSON |스캔 결과(메타데이터 / 점군데이터) |Y|

<details>
<summary>Sample Requst</summary>

```bash
curl --request POST --url http://localhost:3001/api/data/finish --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5X2lkIjoxMCwic3R0dXNfdHlfaWQiOjEsImlhdCI6MTY3NTI0MDQ4MywiZXhwIjoxNjg5NjQwNDgzfQ.cuGTKsDBjRGrh2Lq8GrqT6vRvM1BFr-huVs3iU19JSKPAz9fDswBEvB5FNMT04k6LVR6VIMJ3bJcuUCpKPfvLA}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data prjId=131 --data use=n
```

</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 2520
ETag: W/"9d8-o3ncO1VW2OYWLOBlhA7T/DJKUgk"
Date: Mon, 13 Feb 2023 12:48:55 GMT
Connection: close

{
  "success": true,
  "msg": "project data finished",
  "data": {
    "lidar": [
      [
        131,
        "1652945839325 - 복사본 (10).las",
        "..\\storage\\static\\data\\131\\lidar_file\\1652945839325 - 복사본 (10).las",
        550512,
        3
      ],
    ...
    ],
    "meta": [
      [
        131,
        "1666403875992.csv",
        "..\\storage\\static\\data\\131\\meta_file\\1666403875992.csv",
        333145,
        3
      ]
    ]
  }
}

```

</details>

<br>

-----

### ***10. 클론 프로젝트 생성***
기존 생성된 프로젝트를 기반으로 동일한 프로젝트를 생성한다.
> 원본 프로젝트 ID는 필수항목.  
> 프로젝트 명과, 프로젝트 번호가 파라미터에 생략될 경우,  
> > - 원본프로젝트ID + '-c' + '-time' 라는 이름으로 생성된다 (unique key)  
> > - 예) '124-c-2023-02-23 16:01:23'  (초단위 이하는 생략)
> > - 이는 차후 웹에서 수정 가능

#### Request URL
```http
POST /api/project/clone HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|srcPrjId |Integer |원본 프로젝트 ID |Y|
|prjNm |String |프로젝트 명 |N|
|prjNo |String |프로젝트 번호 |N|


#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |msg |요청에 대한 응답 메시지 |Y|
|data |JSON |생성된 프로젝트 정보 |Y|
|data.prj_id |Integer |생성된 프로젝트 ID |Y|
|data.prj_nm |String |생성된 프로젝트 명 |Y|
|data.vh_id |Integer |생성된 프로젝트 차량 ID |Y|
|data.sv_user_id |String |생성된 프로젝트 담당자 ID |Y|
|data.prj_memo_cn |String |생성된 프로젝트 메모 |Y|
|data.prj_no |String |생성된 프로젝트 번호 |Y|
|data.prj_crt_dt |String |프로젝트 생성 일시 |Y|
|data.cam_sens_id |Integer |생성된 프로젝트 카메라 센서 ID |Y|
|data.lidar_sens_id |Integer |생성된 프로젝트 라이다 센서 ID |Y|
|data.pnu_cd |String |생성된 프로젝트 PNU Code |Y|
|data.weather_cd |Integer |생성된 프로젝트 날씨 코드 (1 / 2 / 3 / 4) |Y|
|data.path |String |프로젝트 저장공간 경로 |Y|
|data.renDirErr |String |프로젝트 경로 이름변경 오류 |Y|
|data.mkDirErr |String |프로젝트 경로 생성 오류|Y|

<details>
<summary>Sample Request</summary>

```bash
curl --request POST --url http://localhost:3001/api/project/clone --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5X2lkIjoxMCwic3R0dXNfdHlfaWQiOjEsImlhdCI6MTY3NTI0MDQ4MywiZXhwIjoxNjg5NjQwNDgzfQ.cuGTKsDBjRGrh2Lq8GrqT6vRvM1BFr-huVs3iU19JSKPAz9fDswBEvB5FNMT04k6LVR6VIMJ3bJcuUCpKPfvLA}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data srcPrjId=131 --data prjNm=cloneName-001 --data prjNo=cloneNo-001
```

</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 502
ETag: W/"1f6-fMwUAH46eYH3KokQJQIvFvQc26A"
Date: Mon, 27 Feb 2023 06:59:10 GMT
Connection: close

{
  "success": true,
  "msg": "clone project succeed",
  "data": {
    "prj_id": 158,
    "prj_nm": "test-clone-org-c-2023-02-27 15:59:10",
    "vh_id": 4,
    "sv_user_id": "admin@test.com",
    "prj_memo_cn": "",
    "prj_no": "clone-000-c-2023-02-27 15:59:10",
    "prj_crt_dt": "2023-02-27T06:59:09.481Z",
    "prcs_strt_dt": null,
    "prcs_end_dt": null,
    "cam_sens_id": -1,
    "lidar_sens_id": -1,
    "pnu_cd": "11010",
    "prj_stts_cd": 1,
    "weather_cd": 1,
    "data_clct_dt": null,
    "use_yn": true,
    "renDirErr": null,
    "mkDirErr": null,
    "path": "D:\\dev\\argos_net\\storage\\static\\data\\158"
  }
}

```

</details>



<br>

-----

### ***11. 데이터 처리 완료 알림***

프로젝트 데이터 처리가 완료되었음을 알린다.

#### Request URL
```http
POST /api/data/prc-finish HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjid |Integer |프로젝트 ID |Y|


#### Response
프로젝트 정보

<details>
<summary>Sample Request</summary>

```bash
curl --request POST --url http://localhost:3001/api/data/prc-finish --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5X2lkIjoxMCwic3R0dXNfdHlfaWQiOjEsImlhdCI6MTY4MjA2OTkwOSwiZXhwIjoxNjk2NDY5OTA5fQ.Qfug_HhyxImUnFiZi2mlWlcNVAxHeXrpAbVy1LgifDRmZOA0nPrJmg1waYMRnwv_19dl4Vs4jU0gPbMw7D66_g}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data prjId=190
```

</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 413
ETag: W/"19d-IBvzN2EkglO4M/+FTyekO5jNVPk"
Date: Tue, 25 Apr 2023 05:34:16 GMT
Connection: close

{
  "success": true,
  "msg": "prj status updated",
  "data": {
    "prj_id": 190,
    "prj_nm": "upload-230302-6",
    "vh_id": 4,
    "sv_user_id": "test3@test.com",
    "prj_memo_cn": "",
    "prj_no": "upload-230302-6",
    "prj_crt_dt": "2023-03-02T06:38:46.672Z",
    "prcs_strt_dt": null,
    "prcs_end_dt": null,
    "cam_sens_id": 9,
    "lidar_sens_id": 1,
    "pnu_cd": "41111",
    "prj_stts_cd": 4,
    "weather_cd": 1,
    "data_clct_dt": "2023-04-25T05:34:16.855Z",
    "use_yn": false,
    "sens_set_id": null
  }
}
```

</details>



<br>



---------

### ~~**101. 데이터 처리 시작**~~ `(내부용)`
~~내부 활용 api~~

```http
POST /api/data/process HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|photo_id |Integer |영상 ID |Y|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |JSON |스캔 결과 |N|
|data.photo_id |Integer |처리 데이터 ID |Y|
|data.prj_id |Integer |데이터를 포함한 프로젝트 ID |Y|
|data.data_ty_id |Integer |데이터 타입 (1.영상 / 2.라이다 / 3.메타데이터) |Y|
|data.data_reg_ty_id |Integer |데이터 등록 방식 (1.웹 업로드 / 2.업로드 압축파일 압축해제 / 3. 디렉토리 스캔) |Y|
|data.org_file_nm |String |원본 파일명 | Y |
|data.prcs_strt_dt |Datetime |데이터 처리 시작 일시 | Y |
|data.prcs_end_dt |Datetime |데이터 처리 완료 일시 | Y |
|data.data_reg_dt |Datetime |데이터 등록 일시 | Y |

<br>

-----

### ***~~101. 프로젝트 데이터 스캔 요청~~*** `deprecated`
정해진 프로젝트 데이터 경로에 데이터를 FTP 등으로 수동 탑재 후,
요청을 보낼경우 해당 경로의 파일을 읽어와 프로젝트 데이터로 추가한다.
프로젝트 생성시 프로젝트 ID로 된 디렉토리까지 생성된다.

> 영상 데이터는 메타데이터 전달시 db에 입력되기때문에
> 점군데이터와 메타 데이터 폴더만 스캔하여 db에 업데이트한다.


#### Request URL
```http
GET /api/project/scan/${prjid} HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 

#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjid |Integer |프로젝트 ID |Y|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |JSON |스캔 결과 |Y|
|data.camFiles |Array[JSON] |영상 파일 스캔 결과 |Y|
|data.camFiles[].name |String |영상 파일명 |Y|
|data.camFiles[].size |String |영상 파일 크기 |Y|
|data.camFiles[].path |String |영상 파일 경로 |Y|
|data.lidarFiles |Array[JSON] |점군데이터 파일 스캔 결과 |Y|
|data.lidarFiles[].name |String |점군데이터 파일명 |Y|
|data.lidarFiles[].size |String |점군데이터 파일 크기 |Y|
|data.lidarFiles[].path |String |점군데이터 파일 경로 |Y|
|data.metaFiles |Array[JSON] |메타데이터 파일 스캔 결과 |Y|
|data.metaFiles[].name |String |메타데이터 파일명 |Y|
|data.metaFiles[].size |String |메타데이터 파일 크기 |Y|
|data.metaFiles[].path |String |메타데이터 파일 경로 |Y|

<details>
<summary>Sample Requst</summary>

```bash
curl --request POST --url http://localhost:3001/api/project/sync --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJfdHlfaWQiOjMsInN0dHVzX3R5X2lkIjoxLCJpYXQiOjE2NDg1MzIzNjAsImV4cCI6MTY2MjkzMjM2MH0.UWfrgGBTihX0YJzq4ctInamOQv-BDK-6ihH_w3lsVP7XcFitMIcqfDSTQw7AjT7CkPTycfjE7N83S7-wVrWT-A}' --header 'content-type: application/x-www-form-urlencoded' --header 'user-agent: vscode-restclient' --data prjid=123 --data startPrcs=false
```
</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 509002
ETag: W/"7c44a-SD32GDImScDiNp8rHJPwec8ea6A"
Date: Mon, 30 Jan 2023 03:32:04 GMT
Connection: close

{
  "success": true,
  "msg": "sync EO data done",
  "data": [
    {
      "photo_id": 609,
      "data_file_path": "..\\storage\\static\\data\\123\\cam_file\\1675045660223.jpg",
      "file_len": "828815",
      "prj_id": 123,
      "data_reg_ty_id": 1,
      "org_file_nm": "im[009157].jpg",
      "prcs_strt_dt": null,
      "prcs_end_dt": null,
      "data_reg_dt": "2023-01-30T02:27:54.668Z",
      "prcs_yn": null,
      "latitude": "37.55732994",
      "longtitude": "126.8621279",
      "altitude": "44.45861594",
      "utm_x": "4158849.714",
      "utm_y": "311166.5261",
      "pitch": "0.350234884",
      "roll": "0.212268338",
      "yaw": "0"
    },
    ...
  ]
```
</details>
<br>

### ***102. 프로젝트 데이터 읽어오기*** 
프로젝트에 추가된 데이터 목록을 요청한다.
#### Request URL
```http
GET /api/project/data/${prjid} HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
```

#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjid |Integer |프로젝트 ID |Y|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |Array(JSON) |스캔 결과 |Y|
|data[].photo_id |Integer |영상 데이터 파일 아이디 |Y|
|data[].data_file_path |String |데이터 파일 경로 |Y|
|data[].file_len |Integer |데이터 파일 크기 |Y|
|data[].prj_id |Integer |데이터 파일이 포함된 프로젝트 ID |Y|
|data[].data_reg_ty_id |Integer |데이터 등록 방식 (1.웹 업로드 / 2.업로드 압축파일 압축해제 / 3. 디렉토리 스캔) |Y|
|data[].org_file_nm |String |원본 파일명 |Y|
|data[].prcs_strt_dt |Datetime |데이터 처리 시작 일시 |Y|
|data[].prcs_end_dt |Datetime |데이터 처리 종료 일시 |Y|
|data[].data_reg_dt |Datetime |데이터 등록 일시 |Y|
|data[].prcs_yn |Boolean |영상처리 여부 |Y|
|data[].prj_nm |String |프로젝트 이름 |Y|
|data[].vh_id |Integer |수집 차량 ID |Y|
|data[].sens_id |Integer |수집 센서 ID |Y|
|data[].sv_user_id |String |프로젝트 담당자 ID |Y|
|data[].prj_memo_cn |String |프로젝트 메모 |Y|
|data[].prj_no |String |프로젝트 번호 |Y|
|data[].prj_crt_dt |String |프로젝트 생성 일시 |Y|
|data[].cam_sens_id |Integer |카메라 센서 ID |Y|
|data[].pnu_cd |String |PNU 코드 |Y|
|data[].latitude |String |촬영 위치(위도) |Y|
|data[].longtitude |String |촬영 위치(경도) |Y|
|data[].altitude |String |촬영 위치(고도) |Y|
|data[].utm_x |String |UTM X 좌표 |Y|
|data[].utm_y |String |UTM Y 좌표 |Y|
|data[].pitch |String |촬영 자세(pitch) |Y|
|data[].roll |String |촬영 자세(roll) |Y|
|data[].yaw |String |촬영 자세(yaw) |Y|


<details>
<summary>Sample Request</summary>

```bash
curl --request GET --url http://dtgeo.iptime.org:3001/api/project/data/54 --header 'authorization: Bearer {eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGVzdEB0ZXN0LmNvbSIsInVzZXJfdHlfaWQiOjMsInN0dHVzX3R5X2lkIjoxLCJpYXQiOjE2NDg1MzIzNjAsImV4cCI6MTY2MjkzMjM2MH0.UWfrgGBTihX0YJzq4ctInamOQv-BDK-6ihH_w3lsVP7XcFitMIcqfDSTQw7AjT7CkPTycfjE7N83S7-wVrWT-A}' --header 'content-type: application/json; charset=UTF-8' --header 'user-agent: vscode-restclient'
```
</details>

<details>
<summary>Sample Response</summary>

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 1278
ETag: W/"4fe-oiOAaWBIfAOUenoyjbJanWNfWgY"
Date: Wed, 18 May 2022 13:57:50 GMT
Connection: close

{
  "success": true,
  "msg": "read data succeed!",
  "data": [
    {
      "photo_id": 385,
      "data_file_path": "..\\storage\\static\\data\\87\\cam_file\\1652881233078.jpg",
      "file_len": "3119561",
      "prj_id": 87,
      "data_reg_ty_id": 1,
      "org_file_nm": "im[000067].jpg",
      "prcs_strt_dt": null,
      "prcs_end_dt": null,
      "data_reg_dt": "2022-05-18T13:40:26.294Z",
      "prcs_yn": null,
      "latitude": null,
      "longtitude": null,
      "altitude": null,
      "utm_x": null,
      "utm_y": null,
      "pitch": null,
      "roll": null,
      "yaw": null,
      "prj_nm": "가나다 프로젝트",
      "vh_id": 4,
      "sv_user_id": "test4@test.com",
      "prj_memo_cn": "",
      "prj_no": "fsdfsdf",
      "prj_crt_dt": "2022-05-18T13:37:29.480Z",
      "cam_sens_id": 4,
      "lidar_sens_id": -1,
      "pnu_cd": "11010",
      "prj_stts_cd": 1,
      "weather_cd": 1,
      "data_clct_dt": null
    },
    {
      "photo_id": 386,
      "data_file_path": "..\\storage\\static\\data\\87\\cam_file\\1652881233109.jpg",
      "file_len": "3210744",
      "prj_id": 87,
      "data_reg_ty_id": 1,
      "org_file_nm": "im[000095].jpg",
      "prcs_strt_dt": null,
      "prcs_end_dt": null,
      "data_reg_dt": "2022-05-18T13:40:26.294Z",
      "prcs_yn": null,
      "latitude": null,
      "longtitude": null,
      "altitude": null,
      "utm_x": null,
      "utm_y": null,
      "pitch": null,
      "roll": null,
      "yaw": null,
      "prj_nm": "가나다 프로젝트",
      "vh_id": 4,
      "sv_user_id": "test4@test.com",
      "prj_memo_cn": "",
      "prj_no": "fsdfsdf",
      "prj_crt_dt": "2022-05-18T13:37:29.480Z",
      "cam_sens_id": 4,
      "lidar_sens_id": -1,
      "pnu_cd": "11010",
      "prj_stts_cd": 1,
      "weather_cd": 1,
      "data_clct_dt": null
    }
  ]
}

```
</details>

---

<br>

### *103. 데이터 메타데이터 싱크* `내부용`
내부 동작용 api

```http
POST /api/project/sync HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|prjid |Integer |프로젝트 ID |Y|
|startPrcs |String |데이터 처리 시작 여부 ('true' : 처리 시작 / default : true) |N|

#### Response
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |Boolean |요청 성공 여부 |Y|
|msg |String |응답 메시지 |Y|
|data |JSON |데이터 싱크 결과 |N|

<br>


---
<br>

## 기타 참고사항

### 가. 데이터 코드표 
#### 가-1. 교통안전 표지 일람
<details>
<summary>접기 / 펼치기</summary>

|sign_id |sign_nm |
|:------:|-------|
|108|좌합류도로|
|109|회전형교차로|
|110|철길건널목|
|111|우로굽은도로|
|112|좌료굽은도로|
|113|우좌로이중굽은도로|
|114|좌우로이중굽은도로|
|115|2방향동행|
|116|오르막경사|
|117|내리막경사|
|118|도로폭이좁아짐|
|119|우측차로없어짐|
|120|좌측차로없어짐|
|121|우측방통행|
|122|양측방통행|
|123|중앙분리대시작|
|124|중앙분리대끝남|
|125|신호기|
|126|미끄러운도로|
|127|강변도로|
|128|노면고르지못함|
|129|과속방지턱|
|130|낙석도로|
|132|횡단보도|
|133|어린이보호|
|134|자전거|
|135|도로공사중|
|136|비행기|
|137|횡풍|
|138|터널|
|138-2|교량|
|139|야생동물보호|
|140|위험|
|141|상습정체구간|
|201|통행금지|
|202|자동차통행금지|
|203|화물자동차통행금지|
|204|승합자동차통행금지|
|205|이륜자동차및원동기장치자전거통행금지|
|206|자동차·이륜자동차및원동기장치자전거통행금지|
|207|경운기·트랙터및손수레통행금지|
|210|자전거통행금지|
|211|진입금지|
|212|직진금지|
|213|우회전금지|
|214|좌회전금지|
|216|유턴금지|
|217|앞지르기금지|
|218|정차·주차금지|
|219|주차금지|
|220|차중량제한|
|221|차높이제한|
|222|차폭제한|
|223|차간거리확보|
|224|최고속도제한|
|225|최저속도제한|
|226|서행|
|227|일시정지|
|228|양보|
|230|보행자보행금지|
|231|위험물적재차량통행금지|
|301|자동차전용도로|
|302|자전거전용도로|
|303|자전거 및 보행자 겸용도로|
|304|회전 교차로|
|305|직진|
|306|우회전|
|307|좌회전|
|308|직진 및 우회전|
|309|직전 및 좌회전|
|309-2|좌회전 및 유턴|
|310|좌우회전|
|311|유턴|
|312|양측방통행|
|313|우측면통행|
|314|좌측면통행|
|315|진행방향통행구분|
|316|우회로|
|317|자전거 및 보행자 통행구분|
|318|자전거전용차로|
|319|주차장|
|320|자전거주차장|
|321|보행자전용도로|
|322|횡단보도|
|323|노인보호(노인보호구역안)|
|324|어린이보호(어린이보호구역안)|
|324-2|장애인보호(장애인보호구역안)|
|325|자전거횡단도|
|326|일방통행|
|327|일방통행|
|328|일방통행|
|329|비보호좌회전|
|330|버스전용차로|
|331|다인승전용차로|
|332|통행우선|
|333|자전거나란히통행허용|
|401|거리|
|402|거리|
|403|구역|
|404|일자|
|405|시간|
|406|시간|
|407|신호등화 상태|
|408|전방우선도로|
|409|안전속도|
|410|기상상태|
|411|노면상태|
|412|교통규제|
|413|통행규제|
|414|차량한정|
|415|통행주의|
|415-2|충돌주의|
|416|표지설명|
|417|구간시작|
|418|구간내|
|419|구간끝|
|420|우방향|
|421|좌방향|
|422|전방|
|423|중량|
|424|노폭|
|425|거리|
|427|해제|
|428|견인지역|
|5001|현수식|
|5002|측주식 종형|
|5003|측주식 횡형|
|5004|중앙주식|
|5005|문형식|
|6001|차량횡형-삼색등|
|6002|차량횡형-화살표 삼색등|
|6003|차량횡형-사색등A|
|6004|차량횡형-사색등B|
|6005|차량종형-삼색등|
|6006|차량종형-화살표 삼색등|
|6007|차량종형-사색등|
|6008|버스삼색등|
|6009|가변형 가변등|
|6010|경보형 경보등|
|6011|보행등|
|6012|자전거 종형-삼색등|
|6013|자전거 종형-이색등|
|6014|차량보조등-중형 삼색등|
|6015|차량 보조등-중형 사색등|
</details>

.
.
.
.
.
.

---------
### ※ template

<details>
<summary>접기/펼치기</summary>

### 3. 프로젝트 생성
#### Request URL
```http
GET /api/equip/list HTTP/1.1
Host: dtgeo.iptime.org:3001
Authorization: Bearer ${ACCESS_TOKEN}
``` 
#### Parameter
| 이름      | 타입      | 설명                      | 필수 |
|:----------|:----------|---------------------------|:----:|
|success |String |성공여부 |Y|
|msg |String |처리 메시지 |N|

#### Response
#### Sample Requst
#### Sample Response

</details>