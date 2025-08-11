import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

/**
 * Pipeline stack with Lambda function invocation for post-deployment validation.
 * Includes automated testing and validation after each deployment stage.
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

    /** Lambda function for post-deployment validation and smoke testing */
    const validationFunction = new lambda.Function(this, 'ValidationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('Validating deployment:', JSON.stringify(event, null, 2));
          
          // Add your validation logic here
          // Example: Check if resources are healthy, run smoke tests, etc.
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Deployment validation completed successfully',
              timestamp: new Date().toISOString()
            })
          };
        };
      `),
      timeout: cdk.Duration.minutes(5),
    });

    // Grant permissions for validation function to access AWS services
    validationFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cloudformation:DescribeStacks',
        'cloudformation:DescribeStackResources',
        'ec2:DescribeInstances',
        'codedeploy:GetApplication',
        'codedeploy:GetDeploymentGroup'
      ],
      resources: ['*'],
    }));

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'LambdaInvokePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('OWNER/REPO', 'main'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ]
      }),
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

    // Add Lambda invocation after test deployment
    testStage.addPost(new ShellStep('InvokeLambdaValidation', {
      commands: [
        `aws lambda invoke --function-name ${validationFunction.functionName} --payload '{"stage":"test"}' response.json`,
        'cat response.json'
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

    // Add Lambda invocation after production deployment
    prodStage.addPost(new ShellStep('InvokeLambdaValidation', {
      commands: [
        `aws lambda invoke --function-name ${validationFunction.functionName} --payload '{"stage":"prod"}' response.json`,
        'cat response.json'
      ]
    }));

    // Output Lambda function information
    new cdk.CfnOutput(this, 'ValidationFunctionName', {
      value: validationFunction.functionName,
      description: 'Lambda function for post-deployment validation',
    });

    new cdk.CfnOutput(this, 'ValidationFunctionArn', {
      value: validationFunction.functionArn,
      description: 'Lambda function ARN for validation',
    });
  }
}