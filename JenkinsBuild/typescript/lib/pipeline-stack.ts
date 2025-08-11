/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep, CodeBuildStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for Jenkins integration (if needed)
    const vpc = new ec2.Vpc(this, 'JenkinsVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create CodeBuild project that integrates with Jenkins
    const jenkinsBuildProject = new codebuild.Project(this, 'JenkinsBuildProject', {
      projectName: 'jenkins-integration-build',
      source: codebuild.Source.gitHub({
        owner: 'aws-samples',
        repo: 'aws-cdk-examples',
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        environmentVariables: {
          JENKINS_URL: { value: 'http://your-jenkins-server:8080' },
          JENKINS_JOB: { value: 'pipeline-build-job' }
        }
      },
      vpc: vpc,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'echo "Preparing Jenkins integration..."',
              'curl --version',
              'echo "Jenkins URL: $JENKINS_URL"'
            ]
          },
          build: {
            commands: [
              'echo "Triggering Jenkins build..."',
              '# Example Jenkins API call (requires authentication setup)',
              '# curl -X POST "$JENKINS_URL/job/$JENKINS_JOB/build" --user $JENKINS_USER:$JENKINS_TOKEN',
              'echo "Jenkins build integration would be triggered here"',
              'echo "Running local build as fallback..."',
              'npm ci',
              'npm run build',
              'npm test'
            ]
          },
          post_build: {
            commands: [
              'echo "Build completed"',
              'echo "Jenkins integration completed"'
            ]
          }
        },
        artifacts: {
          files: [
            '**/*'
          ]
        }
      })
    });

    // Add permissions for Jenkins integration
    jenkinsBuildProject.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue'
      ],
      resources: ['arn:aws:secretsmanager:*:*:secret:jenkins/*']
    }));

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'JenkinsBuildPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('OWNER/REPO', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
    });

    // Add Jenkins build step
    const jenkinsBuildStep = new CodeBuildStep('JenkinsBuild', {
      commands: [
        'echo "Jenkins integration build"',
        'curl --version',
        'echo "Jenkins URL: $JENKINS_URL"',
        'echo "Jenkins build integration would be triggered here"',
        'npm ci',
        'npm run build',
        'npm test'
      ],
      buildEnvironment: {
        environmentVariables: {
          JENKINS_URL: { value: 'http://your-jenkins-server:8080' },
          JENKINS_JOB: { value: 'pipeline-build-job' }
        }
      }
    });

    // Add test stage with Jenkins integration
    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    testStage.addPre(jenkinsBuildStep);
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
    new cdk.CfnOutput(this, 'JenkinsBuildProjectName', {
      value: jenkinsBuildProject.projectName,
      description: 'CodeBuild project for Jenkins integration',
    });

    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
      description: 'VPC ID for Jenkins integration',
    });

    new cdk.CfnOutput(this, 'JenkinsSetupInstructions', {
      value: 'Configure Jenkins server URL and credentials in CodeBuild environment variables',
      description: 'Setup instructions for Jenkins integration',
    });
  }
}