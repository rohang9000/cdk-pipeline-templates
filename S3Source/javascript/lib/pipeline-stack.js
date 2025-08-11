const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } = require('aws-cdk-lib/pipelines');
const { AppStage } = require('./app-stage');

class PipelineStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create S3 bucket for source artifacts
    const sourceBucket = new s3.Bucket(this, 'SourceBucket', {
      bucketName: `pipeline-source-${this.account}-${this.region}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'S3SourcePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.s3(sourceBucket, 'source.zip'),
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

    // Output bucket information
    new cdk.CfnOutput(this, 'SourceBucketName', {
      value: sourceBucket.bucketName,
      description: 'S3 bucket for source artifacts - upload your source.zip here',
    });
  }
}

module.exports = { PipelineStack };