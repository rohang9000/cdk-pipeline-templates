import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

/**
 * Default CDK pipeline stack with GitHub source and multi-stage deployment.
 * Includes automated testing and manual approval for production deployment.
 */
export class PipelineStack extends cdk.Stack {
  /**
   * Creates a new PipelineStack instance.
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack properties
   */
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Self-mutating CDK pipeline with GitHub source */
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'DefaultPipeline',
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

    /** Test stage with automated unit testing */
    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    /** Add unit tests before test deployment */
    testStage.addPre(new ShellStep('UnitTest', {
      commands: [
        'npm ci',
        'npm test'
      ]
    }));

    /** Production stage with manual approval gate */
    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { 
        account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEFAULT_REGION 
      }
    }));

    /** Require manual approval before production deployment */
    prodStage.addPre(new ManualApprovalStep('PromoteToProd'));
  }
}