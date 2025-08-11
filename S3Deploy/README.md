# S3 Deploy Pipeline Template

Pipeline for deploying static websites to S3 with CloudFront distribution.

## Features

- GitHub source integration
- Website build and optimization
- S3 deployment with CloudFront
- Multi-stage deployment (Test → Production)
- Manual approval gate

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed (`npm install -g aws-cdk`)
3. GitHub personal access token stored in AWS Secrets Manager as `github-token`
4. Bootstrapped CDK environment

## Setup

1. **Bootstrap your environments:**
   ```bash
   npx cdk bootstrap aws://ACCOUNT/REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

2. **Update configuration:**
   - Replace `aws-samples/aws-cdk-examples` with your GitHub repository
   - Update account/region in the app entry point
   - Ensure your repository has a `build` script in package.json

3. **Deploy the pipeline:**
   ```bash
   cdk deploy
   ```

## Usage

The pipeline will build your website and deploy it to S3 with CloudFront distribution for global content delivery.

## Architecture

- **Source**: GitHub repository
- **Build**: Website build process (npm run build)
- **Deploy**: S3 bucket with CloudFront distribution
- **Stages**: Test and Production environments