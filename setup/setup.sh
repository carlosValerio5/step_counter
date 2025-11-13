#!/bin/bash

# Step Tracker - Setup Script
# This script handles the complete setup of the project from installing packages to starting the server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get the project root directory (parent of setup directory)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_info "Step Tracker - Project Setup"
echo "================================"
echo ""

# Check for Node.js
print_info "Checking for Node.js..."
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"

# Check for npm
print_info "Checking for npm..."
if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm found: $NPM_VERSION"

# Check for Expo CLI (optional, but recommended)
print_info "Checking for Expo CLI..."
if ! command_exists expo && ! command_exists npx; then
    print_warning "Expo CLI not found globally. Will use npx expo instead."
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_warning "node_modules directory already exists."
    read -p "Do you want to reinstall dependencies? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing node_modules..."
        rm -rf node_modules
        print_success "node_modules removed"
    else
        print_info "Skipping dependency installation. Using existing node_modules."
        SKIP_INSTALL=true
    fi
fi

# Install dependencies
if [ "$SKIP_INSTALL" != true ]; then
    print_info "Installing dependencies..."
    print_info "This may take a few minutes..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Check if package-lock.json exists (indicates successful install)
if [ ! -f "package-lock.json" ] && [ "$SKIP_INSTALL" != true ]; then
    print_warning "package-lock.json not found. Generating it..."
    npm install --package-lock-only
fi

# Optional: Run prebuild (for native projects)
if [ -f "app.json" ] || [ -f "app.config.js" ]; then
    print_info "Checking if prebuild is needed..."
    read -p "Do you want to run 'expo prebuild'? This is needed for native development (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running expo prebuild..."
        if npx expo prebuild; then
            print_success "Prebuild completed successfully"
        else
            print_warning "Prebuild failed or was skipped. This is okay if you're using Expo Go."
        fi
    fi
fi

# Summary
echo ""
print_success "Setup completed successfully!"
echo ""
print_info "Project location: $PROJECT_ROOT"
echo ""

# Ask if user wants to start the server
read -p "Do you want to start the Expo development server now? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_info "Starting Expo development server..."
    echo ""
    print_info "You can:"
    echo "  - Press 'a' to open Android emulator"
    echo "  - Press 'i' to open iOS simulator"
    echo "  - Press 'w' to open in web browser"
    echo "  - Scan QR code with Expo Go app"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the Expo server
    npm start
else
    print_info "To start the server later, run:"
    echo "  npm start"
    echo ""
    print_info "Or use:"
    echo "  npm run ios     # Start iOS simulator"
    echo "  npm run android # Start Android emulator"
    echo "  npm run web     # Start web browser"
    echo ""
fi

