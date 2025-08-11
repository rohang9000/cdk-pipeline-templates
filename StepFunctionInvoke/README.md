# StepFunctionInvoke Pipeline Template

Pipeline template for StepFunctionInvoke deployment pattern.

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
   - Replace repository URL with your source
   - Update account/region in the app entry point

3. **Deploy the pipeline:**
   ```bash
   cdk deploy
   ```

## Usage

See template-specific implementation for detailed usage instructions.
