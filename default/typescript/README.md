# default Pipeline Template (TypeScript)

Basic GitHub source pipeline with CodeBuild and multi-stage deployment.

## Features

- Multi-stage deployment (Test → Production)\n- Manual approval gate for production\n- Self-mutating pipeline\n- CodeBuild integration with Node.js 18

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed (`npm install -g aws-cdk`)
3. Node.js 18+ installed
3. GitHub personal access token stored in AWS Secrets Manager as `github-token`
4. Bootstrapped CDK environment

## Required Configuration

⚠️ **You MUST update these values before deployment:**

### 1. Repository Configuration

**File**: `lib/pipeline-stack.ts`  
**Change**: Replace repository references with your actual repository

```typescript
// BEFORE
input: CodePipelineSource.gitHub('OWNER/REPO', 'main', {

// AFTER
input: CodePipelineSource.gitHub('your-username/your-repo-name', 'main', {
```

### 2. GitHub Token Setup

Store your GitHub personal access token in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "ghp_your_github_personal_access_token_here"
```

**Token Requirements:**
- Scope: `repo` (for private repos) or `public_repo` (for public repos)
- Generate at: https://github.com/settings/tokens

### 3. AWS Environment

Set your AWS account and region:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

Or update `bin/default.ts` with hardcoded values:

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

After initial deployment, the pipeline will automatically trigger on code changes to your repository.

## Architecture

- **Source**: GitHub repository\n- **Build**: AWS CodeBuild (Node.js 18)\n- **Test Stage**: Automated deployment with unit tests\n- **Production Stage**: Manual approval + deployment

## Troubleshooting

- **GitHub authentication fails**: Verify your token is stored in Secrets Manager as `github-token`\n- **CDK synthesis fails**: Ensure you have the required permissions and CDK is bootstrapped\n- **Build fails**: Check that your repository has the expected structure
