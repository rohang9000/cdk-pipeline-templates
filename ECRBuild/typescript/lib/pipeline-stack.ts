/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create ECR repository
    const ecrRepository = new ecr.Repository(this, 'AppRepository', {
      repositoryName: 'pipeline-app',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageTagMutability: ecr.TagMutability.MUTABLE,
      imageScanOnPush: true,
    });

    // Create CodeBuild project for Docker build
    const dockerBuildProject = new codebuild.Project(this, 'DockerBuildProject', {
      projectName: 'pipeline-docker-build',
      source: codebuild.Source.gitHub({
        owner: 'aws-samples',
        repo: 'aws-cdk-examples',
        webhook: true,
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        privileged: true, // Required for Docker builds
        environmentVariables: {
          AWS_DEFAULT_REGION: { value: this.region },
          AWS_ACCOUNT_ID: { value: this.account },
          IMAGE_REPO_NAME: { value: ecrRepository.repositoryName },
          IMAGE_TAG: { value: 'latest' }
        }
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'echo Logging in to Amazon ECR...',
              'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com'
            ]
          },
          build: {
            commands: [
              'echo Build started on `date`',
              'echo Building the Docker image...',
              'docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG .',
              'docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG'
            ]
          },
          post_build: {
            commands: [
              'echo Build completed on `date`',
              'echo Pushing the Docker image...',
              'docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG'
            ]
          }
        }
      })
    });

    // Grant ECR permissions to CodeBuild
    ecrRepository.grantPullPush(dockerBuildProject);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'ECRBuildPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('aws-samples/aws-cdk-examples', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
      dockerEnabledForSynth: true,
      dockerEnabledForSelfMutation: true,
    });

    // Add Docker build step
    const dockerBuildStep = new CodeBuildStep('DockerBuild', {
      commands: [
        'echo "Docker build step"',
        'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com',
        'docker build -t my-app .',
        `docker tag my-app:latest ${this.account}.dkr.ecr.${this.region}.amazonaws.com/pipeline-app:latest`,
        `docker push ${this.account}.dkr.ecr.${this.region}.amazonaws.com/pipeline-app:latest`
      ],
      buildEnvironment: {
        privileged: true
      }
    });

    // Add test stage
    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    testStage.addPre(dockerBuildStep);
    testStage.addPre(new ShellStep('UnitTest', {
      commands: [
        'npm ci',
        'npm test'
      ]
    }));

    // Add production stage with manual approval
    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    prodStage.addPre(new ManualApprovalStep('PromoteToProd'));

    // Outputs
    new cdk.CfnOutput(this, 'ECRRepositoryURI', {
      value: ecrRepository.repositoryUri,
      description: 'ECR Repository URI for Docker images',
    });

    new cdk.CfnOutput(this, 'ECRRepositoryName', {
      value: ecrRepository.repositoryName,
      description: 'ECR Repository Name',
    });

    new cdk.CfnOutput(this, 'DockerBuildProjectName', {
      value: dockerBuildProject.projectName,
      description: 'CodeBuild project for Docker builds',
    });
  }
}