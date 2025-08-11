# LambdaInvoke CDK Pipeline Template (TypeScript)

This template creates a CDK pipeline with GitHub source, CodeBuild for build and test, EC2 deployment, and Lambda function invocation for post-deployment validation.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Test**: AWS CodeBuild
- **Deploy**: EC2 deployment via CodeDeploy
- **Invoke**: AWS Lambda function for validation

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`
3. GitHub personal access token with repository access

## Setup

After running `cdk init pipeline-lambdainvoke --language typescript`, follow these steps:

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

## How It Works

The pipeline includes a Lambda function that validates deployments. After each deployment, the Lambda function is invoked to perform custom validation logic such as:

- Health checks on deployed resources
- Smoke tests
- Notification to external systems
- Custom business logic validation

## Customization

- Modify the Lambda function code in `lib/pipeline-stack.ts`
- Add environment variables to the Lambda function
- Customize validation logic for your specific use case
- Add additional post-deployment steps