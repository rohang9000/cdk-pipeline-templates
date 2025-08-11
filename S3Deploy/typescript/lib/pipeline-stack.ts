import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

/**
 * Pipeline stack for S3 website deployment.
 * Builds and deploys static websites to S3 with CloudFront distribution.
 */
export class PipelineStack extends cdk.Stack {
  /**
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack properties
   * @default undefined
   */
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** CDK pipeline for S3 website deployment */
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'S3DeployPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('OWNER/REPO', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      }),
    });

    /** Test stage for website validation */
    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
    }));

    /** Build and test website before deployment */
    testStage.addPre(new ShellStep('BuildWebsite', {
      commands: [
        'npm ci',
        'npm run build',
        'npm test'
      ]
    }));

    /** Production stage with manual approval */
    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
    }));

    /** Manual approval before production deployment */
    prodStage.addPre(new ManualApprovalStep('PromoteToProd'));
  }
}