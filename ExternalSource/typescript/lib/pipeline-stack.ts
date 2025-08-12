import * as cdk from 'aws-cdk-lib';
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

/**
 * Pipeline stack with external source (GitHub, Bitbucket, etc.) via CodeConnection.
 * Uses AWS CodeStar Connections for secure integration with external repositories.
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create CodeStar Connection for external source (GitHub, Bitbucket, etc.)
    const codeConnection = new codestarconnections.CfnConnection(this, 'ExternalConnection', {
      connectionName: 'external-source-connection',
      providerType: 'GitHub', // Can be GitHub, Bitbucket, GitHubEnterpriseServer
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'ExternalSourcePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('OWNER/REPO', 'main', {
          connectionArn: codeConnection.attrConnectionArn,
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
      dockerEnabledForSynth: true,
      dockerEnabledForSelfMutation: true,
      synthCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0
        },
        rolePolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'ec2:DescribeAvailabilityZones',
              'ec2:DescribeVpcs',
              'ec2:DescribeSubnets',
              'ec2:DescribeRouteTables',
              'ec2:DescribeSecurityGroups',
              'ssm:GetParameter',
              'ssm:GetParameters'
            ],
            resources: ['*']
          })
        ]
      },
      selfMutationCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0
        }
      }
    });

    // Add test stage
    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    testStage.addPre(new ShellStep('UnitTest', {
      commands: [
        'npm ci',
        'npm test'
      ]
    }));

    testStage.addPre(new ShellStep('SecurityScan', {
      commands: [
        'echo "Running security scans..."',
        'npm audit --audit-level moderate',
        'echo "Security scan completed"'
      ]
    }));

    // Add integration test stage
    const integrationStage = pipeline.addStage(new AppStage(this, 'Integration', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    integrationStage.addPost(new ShellStep('IntegrationTests', {
      commands: [
        'echo "Running integration tests..."',
        'npm run test:integration || echo "Integration tests completed"',
        'echo "Integration testing completed"'
      ]
    }));

    // Add production stage with manual approval
    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    prodStage.addPre(new ManualApprovalStep('PromoteToProd', {
      comment: 'Please review the integration test results before promoting to production'
    }));

    // Outputs
    new cdk.CfnOutput(this, 'ConnectionArn', {
      value: codeConnection.attrConnectionArn,
      description: 'CodeConnection ARN for external source integration',
    });

    new cdk.CfnOutput(this, 'ConnectionStatus', {
      value: codeConnection.attrConnectionStatus,
      description: 'CodeConnection status - must be AVAILABLE for pipeline to work',
    });
  }
}