# S3Source CDK Pipeline Template (TypeScript)

This template creates a CDK pipeline with S3 source, CodeBuild for build and test, and EC2 deployment.

## Architecture

- **Source**: S3 bucket
- **Build**: AWS CodeBuild
- **Test**: AWS CodeBuild
- **Deploy**: EC2 deployment via CodeDeploy

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`
3. Bootstrapped CDK environment: `cdk bootstrap`
4. S3 bucket with your source code zip file

## Setup

After running `cdk init pipeline-s3source --language typescript`, follow these steps:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create or identify your S3 source bucket**:
   ```bash
   aws s3 mb s3://my-pipeline-source-bucket
   ```

3. **Update configuration**:
   - Edit `lib/pipeline-stack.ts`: Replace `YOUR_SOURCE_BUCKET` with your S3 bucket name
   - Edit `lib/pipeline-stack.ts`: Replace `path/to/source.zip` with your source zip file path
   - Edit `bin/app.ts`: Update account and region

4. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

5. **Deploy**:
   ```bash
   cdk deploy
   ```

6. **Upload your source code**:
   ```bash
   zip -r source.zip . -x "node_modules/*" "cdk.out/*" "*.git/*"
   aws s3 cp source.zip s3://my-pipeline-source-bucket/path/to/source.zip
   ```

## File Structure

```
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── pipeline-stack.ts   # Pipeline definition
│   ├── app-stack.ts        # Application stack
│   └── app-stage.ts        # Application stage
├── package.json            # Dependencies
├── cdk.json               # CDK configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## S3 Source Configuration

The pipeline monitors an S3 bucket for changes. When you upload a new version of your source code zip file, the pipeline automatically triggers.