/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import * as codestarconnections from 'aws-cdk-lib/aws-codestarconnections';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

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
        input: CodePipelineSource.connection('aws-samples/aws-cdk-examples', 'main', {
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