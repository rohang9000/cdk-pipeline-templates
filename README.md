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
cdk init --from-github rohang9000/cdk-pipeline-templates --template-path default --language typescript

# Or use the shorthand for GitHub
cdk init --from-github rohang9000/cdk-pipeline-templates --template-path S3Deploy --language python
```

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

### Post-Initialization Setup

After running `cdk init`, follow these steps:
1. Install dependencies (automatically done by `cdk init`)
2. Configure GitHub authentication
3. Update repository URL and account/region
4. Bootstrap CDK environment: `cdk bootstrap`
5. Deploy the pipeline: `cdk deploy`

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