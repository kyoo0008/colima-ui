#!/bin/bash

# Colima UI Launcher Script
# 빌드된 앱 실행 또는 개발 모드 실행

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="Colima UI"
BUNDLE_PATH="$SCRIPT_DIR/src-tauri/target/release/bundle/macos/$APP_NAME.app"

show_help() {
    echo "Usage: colima-ui [OPTION]"
    echo ""
    echo "Options:"
    echo "  -d, --dev       개발 모드로 실행 (npm run tauri dev)"
    echo "  -b, --build     앱 빌드 (npm run tauri build)"
    echo "  -i, --install   /Applications에 앱 설치"
    echo "  -h, --help      도움말 표시"
    echo ""
    echo "옵션 없이 실행하면 빌드된 앱을 실행합니다."
}

run_app() {
    if [ -d "$BUNDLE_PATH" ]; then
        echo "Colima UI 실행 중..."
        open "$BUNDLE_PATH"
    elif [ -d "/Applications/$APP_NAME.app" ]; then
        echo "설치된 Colima UI 실행 중..."
        open "/Applications/$APP_NAME.app"
    else
        echo "빌드된 앱이 없습니다. 먼저 빌드하세요:"
        echo "  colima-ui --build"
        echo ""
        echo "또는 개발 모드로 실행:"
        echo "  colima-ui --dev"
        exit 1
    fi
}

run_dev() {
    echo "개발 모드로 실행 중..."
    cd "$SCRIPT_DIR" && npm run tauri dev
}

build_app() {
    echo "Colima UI 빌드 중..."
    cd "$SCRIPT_DIR" && npm run tauri build

    if [ $? -eq 0 ]; then
        echo ""
        echo "빌드 완료! 앱 위치: $BUNDLE_PATH"
        echo ""
        echo "앱을 /Applications에 설치하려면:"
        echo "  colima-ui --install"
    fi
}

install_app() {
    if [ ! -d "$BUNDLE_PATH" ]; then
        echo "빌드된 앱이 없습니다. 먼저 빌드하세요:"
        echo "  colima-ui --build"
        exit 1
    fi

    echo "/Applications에 Colima UI 설치 중..."

    # 기존 앱 제거
    if [ -d "/Applications/$APP_NAME.app" ]; then
        rm -rf "/Applications/$APP_NAME.app"
    fi

    # 앱 복사
    cp -R "$BUNDLE_PATH" "/Applications/"

    if [ $? -eq 0 ]; then
        echo "설치 완료!"
        echo "Spotlight 또는 Launchpad에서 'Colima UI'로 검색하여 실행할 수 있습니다."
    else
        echo "설치 실패. sudo로 다시 시도하세요:"
        echo "  sudo colima-ui --install"
    fi
}

# 메인 로직
case "${1:-}" in
    -d|--dev)
        run_dev
        ;;
    -b|--build)
        build_app
        ;;
    -i|--install)
        install_app
        ;;
    -h|--help)
        show_help
        ;;
    "")
        run_app
        ;;
    *)
        echo "알 수 없는 옵션: $1"
        show_help
        exit 1
        ;;
esac
