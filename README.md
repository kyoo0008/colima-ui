# Colima UI

Docker Desktop과 유사한 Colima 컨테이너 관리 UI 앱입니다.

## 요구 사항

- [Node.js](https://nodejs.org/) (v18 이상)
- [Rust](https://www.rust-lang.org/tools/install)
- [Colima](https://github.com/abiosoft/colima) (Docker 런타임)

### Rust 설치

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### Colima 설치 (macOS)

```bash
brew install colima docker
colima start
```

## 설치

```bash
npm install
```

## 실행

### 개발 모드

```bash
npm run tauri dev
```

### 프로덕션 빌드

```bash
npm run tauri build
```

빌드된 앱은 `src-tauri/target/release/bundle/` 폴더에 생성됩니다.

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
