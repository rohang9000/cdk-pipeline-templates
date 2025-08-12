# ExternalSource Pipeline Template (Python)

Pipeline with external source integration via CodeConnection (GitHub, Bitbucket).

## Features

- Multi-stage deployment (Test → Production)\n- Manual approval gate for production\n- Self-mutating pipeline\n- CodeBuild integration with Node.js 18\n- CodeConnection for external repositories

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed (`npm install -g aws-cdk`)
3. Python 3.8+ installed
3. CodeConnection configured for your external repository
4. Bootstrapped CDK environment

## Required Configuration

⚠️ **You MUST update these values before deployment:**

### 1. Repository Configuration

**File**: `externalsource/pipeline_stack.py`  
**Change**: Replace repository references with your actual repository

```python
# BEFORE
input=pipelines.CodePipelineSource.connection("OWNER/REPO", "main",

# AFTER
input=pipelines.CodePipelineSource.connection("your-username/your-repo-name", "main",
```

### 2. CodeConnection Setup

After deployment, you must complete the CodeConnection setup:

1. Go to AWS Console → Developer Tools → Connections
2. Find the connection created by this template
3. Complete the authorization with your external provider (GitHub, Bitbucket, etc.)

### 3. AWS Environment

Set your AWS account and region:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

Or update `app.py` with hardcoded values:

```python
PipelineStack(app, "externalsourcePipelineStack", env=cdk.Environment(
    account="123456789012",
    region="us-east-1"
))
```

## Setup Steps

1. **Bootstrap CDK environment:**
   ```bash
   npx cdk bootstrap aws://ACCOUNT/REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Update configuration** (see Required Configuration above)

4. **Deploy the pipeline:**
   ```bash
   npx cdk deploy
   ```

## Usage

After initial deployment, the pipeline will automatically trigger on code changes to your repository.

## Architecture

- **Source**: External repository via CodeConnection\n- **Build**: AWS CodeBuild (Node.js 18)\n- **Test Stage**: Automated deployment with unit tests\n- **Production Stage**: Manual approval + deployment

## Troubleshooting

- **Connection fails**: Complete the CodeConnection authorization in AWS Console\n- **CDK synthesis fails**: Ensure you have the required permissions and CDK is bootstrapped\n- **Build fails**: Check that your repository has the expected structure
