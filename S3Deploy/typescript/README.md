# S3Deploy CDK Pipeline Template (TypeScript)

This template creates a CDK pipeline for deploying static websites to S3 with CloudFront distribution.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild (for building static assets)
- **Test**: Frontend testing (unit, integration)
- **Deploy**: S3 bucket with CloudFront distribution

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`
3. GitHub personal access token with repository access

## Setup

After running `cdk init pipeline-s3deploy --language typescript`, follow these steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure GitHub authentication**:
   ```bash
   aws secretsmanager create-secret --name github-token --secret-string "your-github-personal-access-token"
   ```

3. **Update configuration**:
   - Edit `lib/pipeline-stack.ts`: Replace `OWNER/REPO` with your GitHub repository
   - Edit `bin/app.ts`: Update account and region

4. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

5. **Deploy**:
   ```bash
   cdk deploy
   ```

## What Gets Deployed

- **S3 Bucket**: Configured for static website hosting
- **CloudFront Distribution**: Global CDN for fast content delivery
- **Sample Website**: Basic HTML page (replace with your content)

## Customization

- Replace the sample HTML in `lib/app-stack.ts` with your build artifacts
- Modify build commands in the pipeline to match your frontend framework
- Add custom domain and SSL certificate
- Configure additional CloudFront behaviors

## Frontend Framework Examples

### React/Vue/Angular
Update the build commands in `lib/pipeline-stack.ts`:
```typescript
commands: [
  'npm ci',
  'npm run build',  // Builds to dist/ or build/
  'npx cdk synth'
]
```

### Static Site Generators
For Jekyll, Hugo, or similar:
```typescript
commands: [
  'npm ci',
  'hugo',  // or jekyll build
  'npx cdk synth'
]
```