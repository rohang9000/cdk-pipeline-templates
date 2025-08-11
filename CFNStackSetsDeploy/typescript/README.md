# Default CDK Pipeline Template (TypeScript)

This template creates a standard CDK pipeline with GitHub source, CodeBuild for build and test, and EC2 deployment.

## Architecture

- **Source**: GitHub repository (aws-samples/aws-cdk-examples)
- **Build**: AWS CodeBuild
- **Test**: AWS CodeBuild
- **Deploy**: EC2 deployment via CodeDeploy

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

3. **Deploy**:
   ```bash
   cdk deploy
   ```

## Customization

To use your own repository, modify `lib/pipeline-stack.ts`:
```typescript
input: CodePipelineSource.gitHub('your-org/your-repo', 'main', {
  authentication: cdk.SecretValue.secretsManager('github-token'),
})
```

## What Gets Deployed

- **CodePipeline**: Self-mutating pipeline
- **EC2 Instance**: Application deployment target
- **CodeDeploy**: Deployment automation
- **VPC**: Secure network configuration