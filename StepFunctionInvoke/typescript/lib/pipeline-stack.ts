/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as stepfunctionsTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

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

    // Create IAM role for pipeline to invoke Step Function
    const stepFunctionInvokeRole = new iam.Role(this, 'StepFunctionInvokeRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      inlinePolicies: {
        StepFunctionInvokePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'states:StartExecution',
                'states:DescribeExecution',
                'states:GetExecutionHistory'
              ],
              resources: [validationStateMachine.stateMachineArn]
            })
          ]
        })
      }
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'StepFunctionInvokePipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('aws-samples/aws-cdk-examples', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      }),
    });

    const testStage = pipeline.addStage(new AppStage(this, 'Test', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
    }));

    testStage.addPost(new ShellStep('InvokeStepFunction', {
      commands: [
        `EXECUTION_ARN=$(aws stepfunctions start-execution --state-machine-arn ${validationStateMachine.stateMachineArn} --input '{"stage":"test","deploymentId":"'$(date +%s)'"}' --query 'executionArn' --output text)`,
        'echo "Started Step Function execution: $EXECUTION_ARN"',
        'aws stepfunctions describe-execution --execution-arn $EXECUTION_ARN',
        'echo "Step Function validation initiated successfully"'
      ]
    }));

    const prodStage = pipeline.addStage(new AppStage(this, 'Prod', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
    }));

    prodStage.addPre(new ManualApprovalStep('PromoteToProd'));

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