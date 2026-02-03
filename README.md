# Colima UI

Docker Desktop과 유사한 컨테이너 관리 UI 앱입니다.

## 요구 사항

- [Node.js](https://nodejs.org/) (v18 이상)
- [Rust](https://www.rust-lang.org/tools/install)
- Docker 런타임 (Colima, Docker Desktop, 또는 Docker Engine)

---

## 플랫폼별 설치

### macOS

#### Rust 설치
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Docker 런타임 (Colima 권장)
```bash
brew install colima docker
colima start
```

---

### Windows

#### 1. Rust 설치

[rustup-init.exe](https://win.rustup.rs/) 다운로드 후 실행

또는 PowerShell에서:
```powershell
winget install Rustlang.Rustup
```

#### 2. Visual Studio C++ Build Tools 설치

Rust 컴파일에 필요합니다.

[Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) 다운로드 후:
- "C++ build tools" 워크로드 선택
- Windows 10/11 SDK 포함

또는 winget으로:
```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

#### 3. WebView2 런타임

Windows 10/11에는 기본 설치되어 있습니다. 없다면:
[WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) 설치

#### 4. Docker 런타임

**옵션 A: Docker Desktop (권장)**
```powershell
winget install Docker.DockerDesktop
```

**옵션 B: WSL2 + Docker**
```powershell
# WSL2 설치
wsl --install

# WSL2 내에서 Docker 설치
sudo apt update
sudo apt install docker.io
sudo service docker start
```

---

### Linux (Ubuntu/Debian)

#### Rust 설치
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### 시스템 의존성
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

#### Docker 설치
```bash
sudo apt install docker.io
sudo usermod -aG docker $USER
# 로그아웃 후 다시 로그인
```

---

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run tauri dev

# 프로덕션 빌드
npm run tauri build
```

빌드 결과물 위치:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/`

---

## 기능

### Containers 탭
- 컨테이너 목록 조회
- 컨테이너 시작/정지/재시작/삭제
- 컨테이너 상세 정보:
  - **Logs**: 실시간 로그 확인
  - **Inspect**: 환경 변수, 마운트, 네트워크 정보
  - **Stats**: CPU/메모리 사용량 모니터링

### Images 탭
- 이미지 목록 조회
- 이미지 Pull (다운로드)
- 이미지 삭제

### Volumes 탭
- 볼륨 목록 조회
- 볼륨 생성
- 볼륨 삭제

### Builds 탭
- 빌드 히스토리 (예정)

---

## 기술 스택

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Tauri (Rust)
- **상태 관리**: Zustand
- **아이콘**: Lucide React

## 프로젝트 구조

```
colima-ui/
├── src/                      # React 프론트엔드
│   ├── components/           # UI 컴포넌트
│   ├── stores/               # Zustand 상태 관리
│   ├── types/                # TypeScript 타입
│   └── App.tsx
├── src-tauri/                # Tauri Rust 백엔드
│   └── src/
│       └── lib.rs            # Docker CLI 래핑
└── package.json
```

## 라이센스

MIT
