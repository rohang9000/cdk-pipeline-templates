/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CFNDeployPipeline',
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

    // Add production stage with manual approval
    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    prodStage.addPre(new ManualApprovalStep('PromoteToProd'));
  }
}