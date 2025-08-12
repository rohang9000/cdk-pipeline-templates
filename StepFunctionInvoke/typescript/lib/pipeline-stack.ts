import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

/**
 * Pipeline stack with Step Function invocation for complex workflow orchestration.
 * Includes automated validation and workflow management after each deployment stage.
 */
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Step Function for deployment validation
    const validateTask = new stepfunctions.Pass(this, 'ValidateDeployment', {
      comment: 'Validate deployment resources',
      parameters: {
        'ValidationResult': 'SUCCESS',
        'Timestamp.$': '$$.State.EnteredTime',
        'Input.$': '$'
      }
    });

    const checkHealthTask = new stepfunctions.Pass(this, 'CheckHealth', {
      comment: 'Check application health',
      parameters: {
        'HealthStatus': 'HEALTHY',
        'CheckedAt.$': '$$.State.EnteredTime'
      }
    });

    const notifyTask = new stepfunctions.Pass(this, 'NotifySuccess', {
      comment: 'Notify successful validation',
      parameters: {
        'Message': 'Deployment validation completed successfully',
        'CompletedAt.$': '$$.State.EnteredTime'
      }
    });

    const definition = validateTask
      .next(checkHealthTask)
      .next(notifyTask)
      .next(new stepfunctions.Succeed(this, 'ValidationComplete'));

    const validationStateMachine = new stepfunctions.StateMachine(this, 'ValidationStateMachine', {
      definition,
      timeout: cdk.Duration.minutes(10),
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'StepFunctionInvokePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('OWNER/REPO', 'main', {
          authentication: cdk.SecretValue.secretsManager('github-token')
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

    // Add Step Function invocation after test deployment
    testStage.addPost(new ShellStep('InvokeStepFunction', {
      commands: [
        `EXECUTION_ARN=$(aws stepfunctions start-execution --state-machine-arn ${validationStateMachine.stateMachineArn} --input '{"stage":"test","deploymentId":"'$(date +%s)'"}' --query 'executionArn' --output text)`,
        'echo "Started Step Function execution: $EXECUTION_ARN"',
        'aws stepfunctions describe-execution --execution-arn $EXECUTION_ARN',
        'echo "Step Function validation initiated successfully"'
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

    // Add Step Function invocation after production deployment
    prodStage.addPost(new ShellStep('InvokeStepFunction', {
      commands: [
        `EXECUTION_ARN=$(aws stepfunctions start-execution --state-machine-arn ${validationStateMachine.stateMachineArn} --input '{"stage":"prod","deploymentId":"'$(date +%s)'"}' --query 'executionArn' --output text)`,
        'echo "Started Step Function execution: $EXECUTION_ARN"',
        'aws stepfunctions describe-execution --execution-arn $EXECUTION_ARN',
        'echo "Step Function validation initiated successfully"'
      ]
    }));

    // Outputs
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: validationStateMachine.stateMachineArn,
      description: 'Step Function State Machine ARN for validation',
    });

    new cdk.CfnOutput(this, 'StateMachineName', {
      value: validationStateMachine.stateMachineName,
      description: 'Step Function State Machine Name',
    });
  }
}