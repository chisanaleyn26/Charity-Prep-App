#!/bin/bash

# Charity Prep Production Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="charity-prep"
DOMAIN="charityprep.co.uk"
NODE_VERSION="18"
BACKUP_DIR="./backups"
DEPLOY_LOG="./deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOY_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOY_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOY_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOY_LOG"
    exit 1
}

# Pre-deployment checks
check_requirements() {
    log "Checking deployment requirements..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        error "Node.js version $NODE_VERSION or higher is required (current: v$NODE_CURRENT)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        error "git is not installed"
    fi
    
    # Check if we're on main branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        warning "Not on main branch (current: $CURRENT_BRANCH). Continue? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            error "Deployment cancelled"
        fi
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        error "There are uncommitted changes. Please commit or stash them first."
    fi
    
    success "All requirements satisfied"
}

# Environment setup
setup_environment() {
    log "Setting up production environment..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        warning ".env.production not found. Creating from example..."
        if [ -f ".env.production.example" ]; then
            cp .env.production.example .env.production
            warning "Please update .env.production with your actual values before continuing"
            read -p "Press Enter when ready..."
        else
            error ".env.production.example not found"
        fi
    fi
    
    # Validate required environment variables
    source .env.production
    
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY" 
        "SUPABASE_SERVICE_ROLE_KEY"
        "STRIPE_SECRET_KEY"
        "OPENROUTER_API_KEY"
        "NEXTAUTH_SECRET"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    success "Environment configuration valid"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup important files and directories
    tar -czf "$BACKUP_FILE" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        --exclude=backups \
        . || warning "Backup creation had some issues but continuing..."
    
    success "Backup created: $BACKUP_FILE"
}

# Install dependencies
install_dependencies() {
    log "Installing production dependencies..."
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm ci --production=false
    
    success "Dependencies installed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Type checking
    log "Running TypeScript type checking..."
    npm run type-check || error "Type checking failed"
    
    # Linting
    log "Running ESLint..."
    npm run lint || error "Linting failed"
    
    # Unit tests (if they exist)
    if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
        log "Running unit tests..."
        npm run test || error "Unit tests failed"
    fi
    
    success "All tests passed"
}

# Build application
build_application() {
    log "Building application for production..."
    
    # Clear previous build
    rm -rf .next
    
    # Build with production optimizations
    NODE_ENV=production npm run build || error "Build failed"
    
    # Check build output
    if [ ! -d ".next" ]; then
        error "Build output directory not found"
    fi
    
    success "Application built successfully"
}

# Database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Check if Supabase CLI is available
    if command -v supabase &> /dev/null; then
        log "Running Supabase migrations..."
        supabase db push --db-url "$SUPABASE_DB_URL" || warning "Migration push had issues"
    else
        warning "Supabase CLI not found. Please run migrations manually if needed."
    fi
    
    success "Migrations completed"
}

# Deploy to Vercel
deploy_vercel() {
    log "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log "Installing Vercel CLI..."
        npm i -g vercel
    fi
    
    # Deploy to production
    vercel --prod --yes || error "Vercel deployment failed"
    
    success "Deployed to Vercel"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait a moment for deployment to be ready
    sleep 10
    
    # Check if site is responding
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        success "Health check passed (HTTP $HTTP_STATUS)"
    else
        error "Health check failed (HTTP $HTTP_STATUS)"
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove build artifacts if needed
    # rm -rf .next/cache
    
    success "Cleanup completed"
}

# Notify team
notify_team() {
    log "Sending deployment notifications..."
    
    # Slack notification (if webhook URL is set)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        COMMIT_MSG=$(git log -1 --pretty=%B)
        COMMIT_HASH=$(git rev-parse --short HEAD)
        DEPLOY_TIME=$(date)
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\":\"🚀 *Charity Prep Deployed Successfully*\",
                \"attachments\":[{
                    \"color\":\"good\",
                    \"fields\":[
                        {\"title\":\"Environment\",\"value\":\"Production\",\"short\":true},
                        {\"title\":\"Version\",\"value\":\"$COMMIT_HASH\",\"short\":true},
                        {\"title\":\"Domain\",\"value\":\"https://$DOMAIN\",\"short\":true},
                        {\"title\":\"Deploy Time\",\"value\":\"$DEPLOY_TIME\",\"short\":true},
                        {\"title\":\"Commit\",\"value\":\"$COMMIT_MSG\",\"short\":false}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" || warning "Slack notification failed"
    fi
    
    success "Team notified"
}

# Main deployment process
main() {
    log "Starting deployment of $PROJECT_NAME to production"
    log "Deploy log: $DEPLOY_LOG"
    
    check_requirements
    setup_environment
    backup_current
    install_dependencies
    run_tests
    build_application
    run_migrations
    deploy_vercel
    health_check
    cleanup
    notify_team
    
    success "🎉 Deployment completed successfully!"
    log "Application is now live at: https://$DOMAIN"
    log "Deploy log saved to: $DEPLOY_LOG"
}

# Rollback function
rollback() {
    log "Starting rollback process..."
    
    if [ -z "$1" ]; then
        error "Please specify a backup file to rollback to"
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
    fi
    
    log "Rolling back to: $BACKUP_FILE"
    
    # Extract backup
    tar -xzf "$BACKUP_FILE" --exclude=node_modules
    
    # Reinstall dependencies and rebuild
    npm ci
    npm run build
    
    # Redeploy
    vercel --prod --yes
    
    success "Rollback completed"
}

# Script arguments handling
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback "$2"
        ;;
    health-check)
        health_check
        ;;
    backup)
        backup_current
        ;;
    *)
        echo "Usage: $0 {deploy|rollback <backup-file>|health-check|backup}"
        exit 1
        ;;
esac