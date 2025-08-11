/**
 * Application infrastructure stack.
 */
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'AppVPC', { maxAzs: 2 });

    const role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const instance = new ec2.Instance(this, 'AppInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage(),
      role,
    });

    cdk.Tags.of(instance).add('Environment', 'Production');

    const application = new codedeploy.ServerApplication(this, 'CodeDeployApp');
    new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
      application,
      ec2InstanceTags: new codedeploy.InstanceTagSet({ 'Environment': ['Production'] }),
    });

    new cdk.CfnOutput(this, 'InstanceId', { value: instance.instanceId });
  }
}