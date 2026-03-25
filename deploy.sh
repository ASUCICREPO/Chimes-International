#!/bin/bash

###############################################################################
# Chimes International - Deployment Script
# Deploys both frontend and backend components
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="${STACK_NAME:-chimes-backend}"
AWS_REGION="${AWS_REGION:-us-east-1}"
FRONTEND_BUCKET="${FRONTEND_BUCKET:-}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${GREEN}======================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}======================================${NC}"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check for AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    print_info "✓ AWS CLI found"

    # Check for SAM CLI
    if ! command -v sam &> /dev/null; then
        print_error "AWS SAM CLI is not installed. Please install it first."
        exit 1
    fi
    print_info "✓ SAM CLI found"

    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    print_info "✓ Node.js found ($(node --version))"

    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install it first."
        exit 1
    fi
    print_info "✓ npm found ($(npm --version))"

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    print_info "✓ AWS credentials configured"

    print_success "All prerequisites met!"
}

deploy_backend() {
    print_header "Deploying Backend"

    cd backend

    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install

    # Build with SAM
    print_info "Building SAM application..."
    sam build

    # Deploy with SAM
    print_info "Deploying to AWS..."
    if [ -f "samconfig.toml" ]; then
        sam deploy
    else
        sam deploy \
            --stack-name "$STACK_NAME" \
            --region "$AWS_REGION" \
            --capabilities CAPABILITY_IAM \
            --resolve-s3 \
            --no-confirm-changeset \
            --no-fail-on-empty-changeset
    fi

    # Get API endpoint
    API_ENDPOINT=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
        --output text)

    print_success "Backend deployed successfully!"
    print_info "API Endpoint: $API_ENDPOINT"

    cd ..

    # Export API endpoint for frontend
    export VITE_API_ENDPOINT="$API_ENDPOINT"
}

deploy_frontend() {
    print_header "Deploying Frontend"

    cd frontend

    # Check if .env.local exists, create from example if not
    if [ ! -f ".env.local" ]; then
        if [ -n "$VITE_API_ENDPOINT" ]; then
            print_info "Creating .env.local with API endpoint..."
            echo "VITE_API_ENDPOINT=$VITE_API_ENDPOINT" > .env.local
            echo "VITE_AWS_REGION=$AWS_REGION" >> .env.local
        else
            print_error "No .env.local found and VITE_API_ENDPOINT not set"
            exit 1
        fi
    fi

    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install

    # Build frontend
    print_info "Building frontend..."
    npm run build

    # Deploy to S3 if bucket specified
    if [ -n "$FRONTEND_BUCKET" ]; then
        print_info "Deploying to S3 bucket: $FRONTEND_BUCKET"
        aws s3 sync dist/ "s3://$FRONTEND_BUCKET" --delete

        # Invalidate CloudFront cache if distribution ID specified
        if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
            print_info "Invalidating CloudFront cache..."
            aws cloudfront create-invalidation \
                --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
                --paths "/*"
        fi

        print_success "Frontend deployed to S3!"
    else
        print_info "FRONTEND_BUCKET not set. Skipping S3 deployment."
        print_info "Built files are in frontend/dist/"
        print_info "To deploy to Amplify, push to your git repository."
    fi

    cd ..
}

show_summary() {
    print_header "Deployment Summary"

    if [ -n "$API_ENDPOINT" ]; then
        echo -e "Backend API: ${GREEN}$API_ENDPOINT${NC}"
    fi

    if [ -n "$FRONTEND_BUCKET" ]; then
        echo -e "Frontend S3: ${GREEN}s3://$FRONTEND_BUCKET${NC}"
        if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
            CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
                --id "$CLOUDFRONT_DISTRIBUTION_ID" \
                --query 'Distribution.DomainName' \
                --output text 2>/dev/null || echo "")
            if [ -n "$CLOUDFRONT_DOMAIN" ]; then
                echo -e "Frontend URL: ${GREEN}https://$CLOUDFRONT_DOMAIN${NC}"
            fi
        fi
    fi

    echo ""
    print_success "Deployment completed successfully!"
}

###############################################################################
# Main Script
###############################################################################

main() {
    echo ""
    print_header "Chimes International Deployment"
    echo ""

    # Parse command line arguments
    DEPLOY_BACKEND=true
    DEPLOY_FRONTEND=true

    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                DEPLOY_FRONTEND=false
                shift
                ;;
            --frontend-only)
                DEPLOY_BACKEND=false
                shift
                ;;
            --help)
                echo "Usage: ./deploy.sh [options]"
                echo ""
                echo "Options:"
                echo "  --backend-only   Deploy only the backend"
                echo "  --frontend-only  Deploy only the frontend"
                echo "  --help          Show this help message"
                echo ""
                echo "Environment Variables:"
                echo "  STACK_NAME                   Backend stack name (default: chimes-backend)"
                echo "  AWS_REGION                   AWS region (default: us-east-1)"
                echo "  FRONTEND_BUCKET              S3 bucket for frontend (optional)"
                echo "  CLOUDFRONT_DISTRIBUTION_ID   CloudFront distribution ID (optional)"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Run './deploy.sh --help' for usage information."
                exit 1
                ;;
        esac
    done

    # Check prerequisites
    check_prerequisites

    # Deploy backend
    if [ "$DEPLOY_BACKEND" = true ]; then
        deploy_backend
    fi

    # Deploy frontend
    if [ "$DEPLOY_FRONTEND" = true ]; then
        deploy_frontend
    fi

    # Show summary
    show_summary
}

# Run main function
main "$@"
