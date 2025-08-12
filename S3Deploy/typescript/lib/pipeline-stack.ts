import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
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
        input: CodePipelineSource.gitHub('OWNER/REPO', 'main', {
          authentication: cdk.SecretValue.secretsManager('github-token')
        }),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      }),
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