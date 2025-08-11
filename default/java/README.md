# Default CDK Pipeline Template (Java)

This template creates a standard CDK pipeline with GitHub source, CodeBuild for build and test, and EC2 deployment.

## Architecture

- **Source**: GitHub repository
- **Build**: AWS CodeBuild
- **Test**: AWS CodeBuild
- **Deploy**: EC2 deployment via CodeDeploy

## Prerequisites

1. AWS CLI configured with appropriate permissions
2. AWS CDK installed: `npm install -g aws-cdk`
3. Java 11+ and Maven installed
4. GitHub personal access token with repository access

## Setup

After running `cdk init pipeline-default --language java`, follow these steps:

1. **Compile the project**:
   ```bash
   mvn compile
   ```

2. **Configure GitHub authentication**:
   ```bash
   aws secretsmanager create-secret --name github-token --secret-string "your-github-personal-access-token"
   ```

3. **Update configuration**:
   - Edit `src/main/java/com/example/PipelineStack.java`: Replace `OWNER/REPO` with your GitHub repository
   - Edit `src/main/java/com/example/PipelineApp.java`: Update account and region

4. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```

5. **Deploy**:
   ```bash
   cdk deploy
   ```

## File Structure

```
├── src/main/java/com/example/
│   ├── PipelineApp.java      # CDK app entry point
│   ├── PipelineStack.java    # Pipeline definition
│   ├── AppStage.java         # Application stage
│   └── AppStack.java         # Application stack
├── pom.xml                   # Maven configuration
├── cdk.json                  # CDK configuration
└── README.md                 # This file
```

## Maven Commands

- **Compile**: `mvn compile`
- **Test**: `mvn test`
- **Package**: `mvn package`
- **CDK Synth**: `cdk synth`
- **CDK Deploy**: `cdk deploy`

## Customization

- Modify build commands in the `ShellStep`
- Add additional test stages
- Configure different deployment targets
- Add manual approval steps
- Customize EC2 instance configuration

## Testing

Add your tests to `src/test/java/` and they will be automatically run by the pipeline's test stage.