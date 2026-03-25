# Deployment Guide

This guide covers various deployment methods for the Chimes International application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy (Automated)](#quick-deploy-automated)
- [Manual Deployment](#manual-deployment)
- [CI/CD with AWS CodeBuild](#cicd-with-aws-codebuild)
- [Frontend Deployment to AWS Amplify](#frontend-deployment-to-aws-amplify)
- [Environment Variables](#environment-variables)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ AWS Account with appropriate permissions
- ✅ AWS CLI installed and configured (`aws configure`)
- ✅ AWS SAM CLI installed
- ✅ Node.js 18+ installed
- ✅ Git installed (for Amplify deployments)

### Install Required Tools

```bash
# Install AWS CLI
# Visit: https://aws.amazon.com/cli/

# Install SAM CLI
pip install aws-sam-cli

# Verify installations
aws --version
sam --version
node --version
```

---

## Quick Deploy (Automated)

The easiest way to deploy both frontend and backend:

### 1. Using deploy.sh Script

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Deploy everything
./deploy.sh

# Or deploy only backend
./deploy.sh --backend-only

# Or deploy only frontend
./deploy.sh --frontend-only

# Get help
./deploy.sh --help
```

### 2. Environment Variables for deploy.sh

```bash
# Optional environment variables
export STACK_NAME="chimes-backend"           # Backend stack name
export AWS_REGION="us-east-1"                # AWS region
export FRONTEND_BUCKET="my-frontend-bucket"  # S3 bucket for frontend
export CLOUDFRONT_DISTRIBUTION_ID="E1234"    # CloudFront distribution

./deploy.sh
```

---

## Manual Deployment

### Backend Deployment

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build with SAM:**
   ```bash
   sam build
   ```

4. **Deploy to AWS:**
   ```bash
   # First time (guided)
   sam deploy --guided

   # Subsequent deploys
   sam deploy
   ```

5. **Get the API endpoint:**
   ```bash
   aws cloudformation describe-stacks \
     --stack-name chimes-backend \
     --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
     --output text
   ```

### Frontend Deployment

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create .env.local:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API endpoint
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy to S3 (optional):**
   ```bash
   # Sync to S3 bucket
   aws s3 sync dist/ s3://your-bucket-name --delete

   # Invalidate CloudFront cache
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DIST_ID \
     --paths "/*"
   ```

---

## CI/CD with AWS CodeBuild

### Setup

1. **Create CodeBuild Project:**
   - Go to AWS CodeBuild console
   - Create new build project
   - Source: Your GitHub repository
   - Environment: Amazon Linux 2, Standard runtime
   - Buildspec: Use `buildspec.yml` from repository

2. **Configure Environment Variables in CodeBuild:**
   ```
   AWS_REGION=us-east-1
   STACK_NAME=chimes-backend
   FRONTEND_BUCKET=your-bucket-name (optional)
   CLOUDFRONT_DISTRIBUTION_ID=E1234 (optional)
   ```

3. **Set IAM Permissions:**

   CodeBuild service role needs:
   - CloudFormation (create/update stacks)
   - Lambda (create/update functions)
   - API Gateway (create/update APIs)
   - S3 (read/write to artifact buckets)
   - DynamoDB (create/update tables)
   - Bedrock (invoke models)
   - IAM (create/update roles)

4. **Trigger Build:**
   - Push to your main branch
   - Or manually trigger from CodeBuild console

### buildspec.yml Features

- ✅ Builds backend with SAM
- ✅ Deploys backend to AWS
- ✅ Builds frontend with Vite
- ✅ Optionally deploys frontend to S3
- ✅ Caches node_modules for faster builds

---

## Frontend Deployment to AWS Amplify

AWS Amplify provides automatic deployments from Git.

### Setup Amplify Hosting

1. **Connect Repository:**
   - Go to AWS Amplify console
   - Click "New App" → "Host web app"
   - Connect your GitHub/GitLab repository
   - Select the `main` branch
   - Set build settings root directory: `frontend`

2. **Configure Build Settings:**

   Amplify will auto-detect `frontend/amplify.yml`. Or manually set:
   - Build command: `npm run build`
   - Base directory: `frontend`
   - Build output directory: `dist`

3. **Set Environment Variables:**

   In Amplify Console → Environment variables:
   ```
   VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod
   VITE_AWS_REGION=us-east-1
   ```

4. **Deploy:**
   - Push to your repository
   - Amplify automatically builds and deploys
   - Get your Amplify URL (e.g., `https://main.d1234.amplifyapp.com`)

### Custom Domain (Optional)

1. In Amplify console, go to "Domain management"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

---

## Environment Variables

### Backend Environment Variables

Set in `backend/template.yaml`:

```yaml
Environment:
  Variables:
    KNOWLEDGE_BASE_ID: kb-xxxxxxxxx        # Bedrock Knowledge Base ID
    MODEL_ID: amazon.nova-pro-v1:0         # Bedrock model ID
    CONVERSATIONS_TABLE: chimes-conversations
    FEEDBACK_TABLE: chimes-feedback
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod
VITE_AWS_REGION=us-east-1
```

**Important:** Never commit `.env.local` to Git. Use `.env.example` as a template.

---

## Deployment Checklist

Before deploying to production:

- [ ] Backend deployed and tested
- [ ] API endpoint obtained from CloudFormation
- [ ] Frontend `.env.local` updated with API endpoint
- [ ] Frontend built successfully (`npm run build`)
- [ ] Environment variables set correctly
- [ ] DynamoDB tables created
- [ ] Bedrock Knowledge Base configured
- [ ] IAM permissions configured
- [ ] API Gateway CORS configured
- [ ] CloudWatch logs enabled
- [ ] Security: No secrets in code
- [ ] Security: API authentication enabled (if required)

---

## Troubleshooting

### Common Issues

**Issue: SAM deploy fails with permission errors**
- Solution: Ensure your IAM user/role has CloudFormation, Lambda, API Gateway, and IAM permissions

**Issue: Frontend can't connect to backend**
- Solution: Check CORS settings in API Gateway and verify API endpoint in `.env.local`

**Issue: Bedrock access denied**
- Solution: Ensure Lambda execution role has `bedrock:InvokeModel` and `bedrock:Retrieve` permissions

**Issue: DynamoDB table not found**
- Solution: Run `backend/setup-dynamodb.sh` or ensure tables are created in SAM template

### Logs and Monitoring

- **Backend logs:** CloudWatch Logs → `/aws/lambda/chimes-*`
- **Build logs:** CodeBuild console → Build history
- **Amplify logs:** Amplify console → Build logs

---

## Next Steps

After successful deployment:

1. Test the application thoroughly
2. Set up monitoring and alarms
3. Configure backups for DynamoDB
4. Set up custom domain (optional)
5. Enable AWS WAF for security (optional)
6. Set up automated testing in CI/CD

---

## Support

For issues or questions:
- Check CloudWatch Logs for errors
- Review SAM deployment outputs
- Consult AWS documentation
- Check the GitHub repository issues
