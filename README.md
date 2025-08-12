# CDK Pipeline Templates

🚀 **Production-ready AWS CDK pipeline templates** for the most common CI/CD scenarios. Each template is a complete, working CDK application that you can use immediately.

## ✨ What You Get

- **Complete CDK Applications**: Ready to deploy with `cdk deploy`
- **Self-Mutating Pipelines**: Automatically update themselves when code changes
- **Multi-Stage Deployment**: Test → Production with manual approval
- **Security Best Practices**: Proper IAM roles, VPC configuration, encryption
- **Multiple Languages**: TypeScript, Python, Java, JavaScript, C#, Go

## Available Templates

| Template | Source | Build | Test | Deploy | Invoke |
|----------|--------|-------|------|--------|--------|
| [default](./default/) | GitHub | CodeBuild | CodeBuild | EC2Deploy | N/A |
| [S3Source](./S3Source/) | S3 | CodeBuild | CodeBuild | EC2Deploy | N/A |
| [LambdaInvoke](./LambdaInvoke/) | GitHub | CodeBuild | CodeBuild | EC2Deploy | Lambda |
| [StepFunctionInvoke](./StepFunctionInvoke/) | GitHub | CodeBuild | CodeBuild | EC2Deploy | StepFunction |
| [S3Deploy](./S3Deploy/) | GitHub | CodeBuild | CodeBuild | S3 | N/A |
| [ExternalSource](./ExternalSource/) | CodeConnection | CodeBuild | CodeBuild | EC2Deploy | N/A |
| [JenkinsBuild](./JenkinsBuild/) | GitHub | Jenkins | CodeBuild | EC2Deploy | N/A |
| [ECRBuild](./ECRBuild/) | GitHub | ECR | CodeBuild | EC2Deploy | N/A |
| [CFNDeploy](./CFNDeploy/) | GitHub | CodeBuild | CodeBuild | CFNDeploy | N/A |
| [CFNStackSetsDeploy](./CFNStackSetsDeploy/) | GitHub | CodeBuild | CodeBuild | CFNStackSetsDeploy | N/A |
| [ECSDeploy](./ECSDeploy/) | GitHub | CodeBuild | CodeBuild | ECSDeploy | N/A |

## Supported Languages

Each template is available in the following programming languages:
- TypeScript
- JavaScript
- Python
- Java
- C#
- Go

## Quick Start

### Using with CDK Init

Initialize a new project using any template from this repository:

```bash
# Initialize with a specific template
cdk init --from-github rohang9000/cdk-pipeline-templates --template-path default --language=typescript

# Or use the shorthand for GitHub
cdk init --from-github rohang9000/cdk-pipeline-templates --template-path S3Deploy --language=python
```

**Note**: This repository contains multiple CDK pipeline templates, so you must specify `--template-path` to choose which template to use.

### Available Templates

Choose from any of these pipeline templates:
- `default` - Basic GitHub source with CodeBuild
- `S3Source` - S3 source with CodeBuild  
- `LambdaInvoke` - GitHub source with Lambda invocation
- `StepFunctionInvoke` - GitHub source with Step Function invocation
- `S3Deploy` - GitHub source with S3 deployment
- `ExternalSource` - External source via CodeConnection
- `JenkinsBuild` - GitHub source with Jenkins build
- `ECRBuild` - GitHub source with ECR build
- `CFNDeploy` - GitHub source with CloudFormation deployment
- `CFNStackSetsDeploy` - GitHub source with CloudFormation StackSets
- `ECSDeploy` - GitHub source with ECS deployment

Example usage:
```bash
cdk init --from-github rohang9000/cdk-pipeline-templates --template-path LambdaInvoke --language=typescript
```

### Post-Initialization Setup

After running `cdk init`, follow these steps:

1. **Push your code to GitHub:**
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

2. **Configure the template:**
   
   ⚠️ **REQUIRED**: Update repository references in your pipeline stack:
   - **TypeScript**: Replace `'OWNER/REPO'` in `lib/pipeline-stack.ts`
   - **Python**: Replace `"OWNER/REPO"` in `templatename/pipeline_stack.py`
   - **Other languages**: See [CONFIGURATION.md](./CONFIGURATION.md) for details

3. **Set up authentication:**
   ```bash
   # For GitHub-based templates
   aws secretsmanager create-secret \
     --name github-token \
     --secret-string "ghp_your_github_token_here"
   ```

4. **Configure AWS environment:**
   ```bash
   export CDK_DEFAULT_ACCOUNT=123456789012
   export CDK_DEFAULT_REGION=us-east-1
   ```

5. **Bootstrap CDK environment:**
   ```bash
   npx cdk bootstrap aws://ACCOUNT/REGION --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
   ```

6. **Deploy the pipeline:**
   ```bash
   npx cdk deploy
   ```

📖 **For detailed configuration instructions, see [CONFIGURATION.md](./CONFIGURATION.md)**

## Prerequisites

- AWS CLI configured with appropriate permissions
- AWS CDK installed (`npm install -g aws-cdk`)
- Bootstrapped CDK environment (`cdk bootstrap`)
- GitHub personal access token stored in AWS Secrets Manager (for GitHub-based templates)

## Usage

Each template includes:
- Complete CDK application structure
- Pipeline stack definition
- Application stack definition
- Configuration files
- README with specific setup instructions

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.