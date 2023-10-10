

access denied
reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\system /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f

로그온 실패: 사용자는 이 컴퓨터에서는 요청된 로그온 유형을 허가받지 않았습니다.
  - -i 옵션 추가


```
PsExec -i \\192.168.219.113 -u 우리집 -p rudgns18! ipconfig
```


<br>  

## las point cloud viewer 관련
 - https://github.com/potree/potree
   - 설치형 프로그램
 - https://github.com/verma/plasio
   - 설치형 프로젝트
 - https://github.com/iTowns/itowns
   - 공간정보 시각화 프레임워크 (three.js 기반)
   - 공간정보 전체에 대한 내용으로 덩치 큼
   - doc : http://www.itowns-project.org/itowns/docs/#home
   - ex: http://www.itowns-project.org/itowns/examples/

<br>

## 윈도우 서비스로 실행시 네트워크 드라이브 접근 문제
> 서비스를 실행하는 Local System 계정에서 네트워크 드라이브 매핑이 되지 않아 발생

 - sysinternalas에 있는 psexec를 사용하면 간단히 SYSTEM 계정권한을 사용할 수 있다.
 - cmd로 네트워크 드라이브를 맵핑할 수 있으니 cmd 자체를 SYSTEM 계정권한으로 띄우고 거기다가 네트워크 드라이브 맵핑 커맨드를 날려 
 - SYSTEM 계정권한으로 다시한번더 네트워크 드라이브를 맵핑하면 된다.

```dos
실행순서
1. cmd.exe를 우선 관리자 권한으로 실행
2. psexec가 있는 곳으로 이동
3. psexec -i -s cmd.exe 명령어 입력
4. cmd.exe가 SYSTEM 권한으로 실행..
~~~5. net use J: \\102.12.xxx.xxx\TestFD /persistent:yes 입력~~~
6. net use Z: \\192.168.22.202\dynamic /persistent:yes 입력
  ->persistent:yes 의 옵션은 계속 연결유지를 한다는 의미.
6. 공유폴더를 열어놓은 윈도우의 ID와 패스워들 입력하라고 나온다.
7. 윈도우 계정과 패스워드 입력하여 설정 마무리
```
이렇게 되면 연결은 되었다고 나오나 실제 드라이브는 연결이 안되어 있다고 표시된다. (뭐 당연히 현재 로그인 사용자 계정이 아닌 SYSTEM 계정권한으로 했으니..) 하지만 마우스 선택하면 잘 보임.