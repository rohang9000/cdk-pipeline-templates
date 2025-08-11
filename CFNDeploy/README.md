# CloudFormation Deploy Pipeline Template

Pipeline using CloudFormation deployment with CodeDeploy integration.

## Features

- GitHub source integration
- CodeBuild for build and test
- EC2 infrastructure with CodeDeploy
- CloudFormation-based deployment
- Multi-stage deployment

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
   - Configure EC2 instance tags for CodeDeploy targeting

3. **Deploy the pipeline:**
   ```bash
   cdk deploy
   ```

## Usage

The pipeline deploys EC2 infrastructure with CodeDeploy configuration for application deployment.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Infrastructure**: VPC, EC2 instances, Security Groups
- **Deployment**: CodeDeploy application and deployment groups