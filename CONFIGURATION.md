# Required Configuration

After initializing your project with `cdk init`, you **MUST** update these fields before deployment:

## 1. GitHub Repository URL

**Location**: All `pipeline-stack` files  
**Current**: `'aws-samples/aws-cdk-examples'`  
**Update to**: `'your-username/your-repo-name'`

```typescript
// BEFORE
input: CodePipelineSource.gitHub('aws-samples/aws-cdk-examples', 'main')

// AFTER  
input: CodePipelineSource.gitHub('your-username/your-repo-name', 'main')
```

## 2. GitHub Token Setup

Store your GitHub personal access token in AWS Secrets Manager:

```bash
aws secretsmanager create-secret --name github-token --secret-string "your-github-token"
```

## 3. AWS Account/Region

**Location**: App entry point files  
**Current**: Uses environment variables  
**Action**: Set environment variables or hardcode values

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

## 4. Bootstrap CDK Environment

```bash
cdk bootstrap aws://ACCOUNT/REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

## 5. Deploy

```bash
cdk deploy
```

**⚠️ Templates will not work without these updates!**