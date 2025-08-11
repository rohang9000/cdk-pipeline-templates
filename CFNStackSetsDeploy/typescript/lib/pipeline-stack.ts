/**
 * Pipeline stack with multi-stage deployment.
 */
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { AppStage } from './app-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for StackSets templates
    const stackSetsBucket = new s3.Bucket(this, 'StackSetsBucket', {
      bucketName: `stacksets-templates-${this.account}-${this.region}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create IAM role for StackSets administration
    const stackSetsAdminRole = new iam.Role(this, 'StackSetsAdminRole', {
      roleName: 'AWSCloudFormationStackSetsAdministrationRole',
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSCloudFormationStackSetsAdministrationRole')
      ]
    });

    // Create IAM role for StackSets execution
    const stackSetsExecutionRole = new iam.Role(this, 'StackSetsExecutionRole', {
      roleName: 'AWSCloudFormationStackSetsExecutionRole',
      assumedBy: new iam.AccountRootPrincipal(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('PowerUserAccess')
      ]
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CFNStackSetsDeployPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('aws-samples/aws-cdk-examples', 'main'),
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

    // Add StackSets deployment step
    testStage.addPost(new ShellStep('DeployStackSets', {
      commands: [
        'echo "Preparing StackSets deployment..."',
        `aws s3 cp cdk.out/ s3://${stackSetsBucket.bucketName}/templates/ --recursive`,
        'echo "Templates uploaded to S3"',
        'echo "Creating StackSet..."',
        `aws cloudformation create-stack-set --stack-set-name TestStackSet --template-url https://${stackSetsBucket.bucketName}.s3.amazonaws.com/templates/TestStack.template.json --capabilities CAPABILITY_IAM || echo "StackSet may already exist"`,
        'echo "Creating StackSet instances..."',
        `aws cloudformation create-stack-instances --stack-set-name TestStackSet --accounts ${this.account} --regions ${this.region} || echo "Stack instances may already exist"`,
        'echo "StackSets deployment completed"'
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

    // Add production StackSets deployment
    prodStage.addPost(new ShellStep('DeployProdStackSets', {
      commands: [
        'echo "Deploying production StackSets..."',
        `aws s3 cp cdk.out/ s3://${stackSetsBucket.bucketName}/prod-templates/ --recursive`,
        `aws cloudformation create-stack-set --stack-set-name ProdStackSet --template-url https://${stackSetsBucket.bucketName}.s3.amazonaws.com/prod-templates/ProdStack.template.json --capabilities CAPABILITY_IAM || echo "StackSet may already exist"`,
        `aws cloudformation create-stack-instances --stack-set-name ProdStackSet --accounts ${this.account} --regions ${this.region} || echo "Stack instances may already exist"`,
        'echo "Production StackSets deployment completed"'
      ]
    }));

    // Outputs
    new cdk.CfnOutput(this, 'StackSetsBucketName', {
      value: stackSetsBucket.bucketName,
      description: 'S3 bucket for StackSets templates',
    });

    new cdk.CfnOutput(this, 'StackSetsAdminRoleArn', {
      value: stackSetsAdminRole.roleArn,
      description: 'IAM role for StackSets administration',
    });

    new cdk.CfnOutput(this, 'StackSetsExecutionRoleArn', {
      value: stackSetsExecutionRole.roleArn,
      description: 'IAM role for StackSets execution',
    });
  }
}