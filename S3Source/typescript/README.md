# S3Source Pipeline Template (TypeScript)

Pipeline with S3 source bucket for artifact storage and multi-stage deployment.

## Features

- Multi-stage deployment (Test → Production)\n- Manual approval gate for production\n- Self-mutating pipeline\n- CodeBuild integration with Node.js 18\n- S3 bucket for source artifacts

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed (`npm install -g aws-cdk`)
3. Node.js 18+ installed
3. S3 bucket will be created automatically
4. Bootstrapped CDK environment

## Required Configuration

⚠️ **You MUST update these values before deployment:**

### 1. Repository Configuration

No repository configuration needed - uses S3 bucket for source artifacts.
Upload your source code as `source.zip` to the created S3 bucket.

### 2. S3 Bucket Access

The pipeline will create an S3 bucket automatically. Upload your source code as `source.zip` to trigger the pipeline.

### 3. AWS Environment

Set your AWS account and region:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

Or update `bin/s3source.ts` with hardcoded values:

```typescript
env: {
  account: '123456789012',
  region: 'us-east-1',
}
```

## Setup Steps

1. **Bootstrap CDK environment:**
   ```bash
   npx cdk bootstrap aws://ACCOUNT/REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update configuration** (see Required Configuration above)

4. **Deploy the pipeline:**
   ```bash
   npx cdk deploy
   ```

## Usage

Upload your source code as `source.zip` to the S3 bucket created by the pipeline to trigger deployments.

## Architecture

- **Source**: S3 bucket\n- **Build**: AWS CodeBuild (Node.js 18)\n- **Test Stage**: Automated deployment with unit tests\n- **Production Stage**: Manual approval + deployment

## Troubleshooting

- **Pipeline not triggering**: Ensure you upload source.zip to the S3 bucket\n- **CDK synthesis fails**: Ensure you have the required permissions and CDK is bootstrapped\n- **Build fails**: Check that your repository has the expected structure
