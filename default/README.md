# Default Pipeline Template

Basic GitHub source pipeline with CodeBuild and multi-stage deployment.

## Features

- GitHub source integration
- CodeBuild for build and test
- Multi-stage deployment (Test → Production)
- Manual approval gate for production
- Self-mutating pipeline

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

2. **Update pipeline configuration:**
   - Replace `'OWNER/REPO'` in `lib/pipeline-stack.*` with your GitHub repository (e.g., `'myusername/my-pipeline-repo'`)
   - Update account/region in the app entry point if needed

3. **Deploy the pipeline:**
   ```bash
   cdk deploy
   ```

## Usage

After initial deployment, the pipeline will automatically trigger on code changes to your GitHub repository.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Test Stage**: Automated deployment with unit tests
- **Production Stage**: Manual approval + deployment