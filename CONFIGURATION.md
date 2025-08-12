# Configuration Guide for CDK Pipeline Templates

This guide explains how to configure any template in this repository for your own use.

## Quick Start

1. **Initialize your project:**
   ```bash
   cdk init --from-github rohang9000/cdk-pipeline-templates --template-path TEMPLATE_NAME --language=LANGUAGE
   ```

2. **Configure the template** (see sections below)

3. **Deploy:**
   ```bash
   npx cdk deploy
   ```

## Required Configuration

⚠️ **All templates require these configurations before deployment:**

### 1. Repository Configuration

**What to change**: Replace placeholder repository references with your actual repository.

**Templates affected**: All except S3Source

| Template | File Location | What to Replace |
|----------|---------------|-----------------|
| TypeScript | `lib/pipeline-stack.ts` | `'OWNER/REPO'` → `'your-username/your-repo'` |
| Python | `templatename/pipeline_stack.py` | `"OWNER/REPO"` → `"your-username/your-repo"` |
| JavaScript | `lib/pipeline-stack.js` | `'OWNER/REPO'` → `'your-username/your-repo'` |
| Java | `src/main/java/.../PipelineStack.java` | `"OWNER/REPO"` → `"your-username/your-repo"` |
| C# | `src/PipelineStack.cs` | `"OWNER/REPO"` → `"your-username/your-repo"` |

### 2. Authentication Setup

#### GitHub-based Templates (default, LambdaInvoke, StepFunctionInvoke, etc.)

Store your GitHub personal access token in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "ghp_your_github_personal_access_token_here"
```

**Token Requirements:**
- Scope: `repo` (private repos) or `public_repo` (public repos)
- Generate at: https://github.com/settings/tokens

#### ExternalSource Template

After deployment, complete CodeConnection setup:
1. Go to AWS Console → Developer Tools → Connections
2. Find your connection
3. Complete authorization with your provider

#### S3Source Template

No authentication needed - upload `source.zip` to the created S3 bucket.

### 3. AWS Environment Configuration

**Option A: Environment Variables**
```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

**Option B: Hardcode in App File**

TypeScript (`bin/templatename.ts`):
```typescript
env: {
  account: '123456789012',
  region: 'us-east-1',
}
```

Python (`app.py`):
```python
env=cdk.Environment(
    account="123456789012",
    region="us-east-1"
)
```

## Template-Specific Configuration

### S3Source
- **Special setup**: No repository needed
- **Usage**: Upload `source.zip` to the created S3 bucket
- **Bucket name**: Will be output after deployment

### LambdaInvoke
- **Additional feature**: Lambda function for validation
- **Customization**: Edit the Lambda function code in `pipeline-stack` file

### ExternalSource
- **Provider types**: GitHub, Bitbucket, GitHubEnterpriseServer
- **Configuration**: Update `providerType` in pipeline stack
- **Post-deployment**: Complete connection authorization

### ECSDeploy
- **Additional file**: Includes `Dockerfile`
- **Customization**: Modify Dockerfile for your application

### CFNStackSetsDeploy
- **Multi-account**: Designed for cross-account deployments
- **Additional setup**: Configure target accounts and regions

## Bootstrap Requirements

All templates require CDK bootstrap:

```bash
npx cdk bootstrap aws://ACCOUNT/REGION \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

## Common Issues and Solutions

### GitHub Authentication Fails
- **Cause**: Missing or incorrect GitHub token
- **Solution**: Verify token is stored in Secrets Manager as `github-token`

### CDK Synthesis Fails
- **Cause**: Missing permissions or bootstrap
- **Solution**: Ensure CDK is bootstrapped and you have required permissions

### Build Fails
- **Cause**: Repository structure doesn't match template expectations
- **Solution**: Ensure your repo has the expected files (package.json, requirements.txt, etc.)

### Connection Issues (ExternalSource)
- **Cause**: CodeConnection not authorized
- **Solution**: Complete authorization in AWS Console

## Security Best Practices

1. **Use least privilege**: Only grant necessary permissions
2. **Rotate tokens**: Regularly update GitHub tokens
3. **Monitor access**: Review CloudTrail logs
4. **Secure secrets**: Use AWS Secrets Manager for sensitive data

## Multi-Language Support

Each template supports:
- **TypeScript**: Full-featured with type safety
- **Python**: Pythonic syntax with full CDK support
- **JavaScript**: Similar to TypeScript without types
- **Java**: Enterprise-ready with Maven
- **C#**: .NET integration with NuGet

Choose the language that best fits your team's expertise and existing infrastructure.

## Getting Help

1. **Template-specific README**: Each template/language has detailed instructions
2. **AWS CDK Documentation**: https://docs.aws.amazon.com/cdk/
3. **GitHub Issues**: Report problems in this repository
4. **AWS Support**: For AWS-specific issues

## Next Steps

After successful deployment:
1. **Test the pipeline**: Make a code change to trigger it
2. **Customize stages**: Add/modify deployment stages as needed
3. **Monitor**: Set up CloudWatch alarms and notifications
4. **Scale**: Consider multi-region or multi-account deployments