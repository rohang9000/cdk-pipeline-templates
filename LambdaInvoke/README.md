# Lambda Invoke Pipeline Template

Pipeline with Lambda function invocation for post-deployment validation.

## Features

- GitHub source integration
- CodeBuild for build and test
- Lambda function for deployment validation
- Post-deployment smoke testing
- Multi-stage deployment with validation

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
   - Customize validation logic in the Lambda function

3. **Deploy the pipeline:**
   ```bash
   cdk deploy
   ```

## Usage

After each deployment stage, the pipeline automatically invokes a Lambda function to validate the deployment and run smoke tests.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Validation**: Lambda function with CloudFormation permissions
- **Stages**: Test and Production with post-deployment validation