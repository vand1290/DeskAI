#!/bin/bash

# DeskAI Setup Verification Script
# This script verifies that your development environment is properly configured

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         DeskAI Setup Verification                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

EXIT_CODE=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION installed"
else
    echo "✗ Node.js not found. Please install Node.js 16 or higher"
    EXIT_CODE=1
fi
echo ""

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm $NPM_VERSION installed"
else
    echo "✗ npm not found"
    EXIT_CODE=1
fi
echo ""

# Check Rust
echo "Checking Rust..."
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo "✓ $CARGO_VERSION installed"
else
    echo "✗ Rust/Cargo not found. Please install from https://rustup.rs"
    EXIT_CODE=1
fi
echo ""

# Check dependencies
echo "Checking project dependencies..."
if [ -d "node_modules" ]; then
    echo "✓ Node modules installed"
else
    echo "⚠ Node modules not found. Run: npm install"
fi
echo ""

# Check TypeScript compilation
echo "Checking TypeScript compilation..."
if npx tsc --noEmit; then
    echo "✓ TypeScript compiles successfully"
else
    echo "✗ TypeScript compilation has errors"
    EXIT_CODE=1
fi
echo ""

# Check Rust compilation
echo "Checking Rust compilation..."
if cd src-tauri && cargo check --quiet 2>&1; then
    echo "✓ Rust backend compiles successfully"
    cd ..
else
    echo "✗ Rust compilation has errors"
    EXIT_CODE=1
    cd ..
fi
echo ""

# Platform-specific checks
echo "Checking platform-specific dependencies..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Platform: Linux"
    if command -v pkg-config &> /dev/null; then
        if pkg-config --exists webkit2gtk-4.1; then
            echo "✓ webkit2gtk-4.1 found"
        else
            echo "⚠ webkit2gtk-4.1 not found. Install with:"
            echo "  sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf"
        fi
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "Platform: Windows"
    echo "✓ Windows platform detected"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Platform: macOS"
    echo "✓ macOS platform detected"
fi
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════╗"
if [ $EXIT_CODE -eq 0 ]; then
    echo "║  ✓ All checks passed! Ready to develop.                 ║"
    echo "║                                                          ║"
    echo "║  Next steps:                                             ║"
    echo "║  • Run 'npm run tauri:dev' to start development         ║"
    echo "║  • Run 'npm run tauri:build' to build for production    ║"
else
    echo "║  ⚠ Some checks failed. Please fix the issues above.     ║"
fi
echo "╚══════════════════════════════════════════════════════════╝"

exit $EXIT_CODE
