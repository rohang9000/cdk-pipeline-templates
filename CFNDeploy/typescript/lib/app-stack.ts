import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

/**
 * Application stack for CloudFormation deployment pipeline.
 * Creates EC2 infrastructure with CodeDeploy configuration.
 */
export class AppStack extends cdk.Stack {
  /**
   * Creates a new AppStack instance.
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stack properties
   */
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** VPC for application infrastructure */
    const vpc = new ec2.Vpc(this, 'AppVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    /** IAM role for EC2 instances with required permissions */
    const ec2Role = new iam.Role(this, 'EC2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    /** Add S3 permissions for CodeDeploy agent */
    ec2Role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket',
      ],
      resources: ['*'],
    }));

    /** Instance profile for EC2 role attachment */
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [ec2Role.roleName],
    });

    /** Security group allowing HTTP traffic */
    const securityGroup = new ec2.SecurityGroup(this, 'AppSecurityGroup', {
      vpc,
      description: 'Security group for application instances',
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic'
    );

    /** EC2 instance for application deployment */
    const instance = new ec2.Instance(this, 'AppInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup,
      role: ec2Role,
      userData: ec2.UserData.forLinux(),
    });

    /** Install CodeDeploy agent on instance startup */
    instance.userData.addCommands(
      'yum update -y',
      'yum install -y ruby wget',
      'cd /home/ec2-user',
      'wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install',
      'chmod +x ./install',
      './install auto'
    );

    /** Tag instance for CodeDeploy targeting */
    cdk.Tags.of(instance).add('Environment', 'Production');
    cdk.Tags.of(instance).add('Application', 'MyApp');

    /** CodeDeploy application for deployment management */
    const application = new codedeploy.ServerApplication(this, 'CodeDeployApp', {
      applicationName: 'MyApplication',
    });

    /** Deployment group targeting tagged EC2 instances */
    new codedeploy.ServerDeploymentGroup(this, 'DeploymentGroup', {
      application,
      deploymentGroupName: 'MyDeploymentGroup',
      installAgent: true,
      ec2InstanceTags: new codedeploy.InstanceTagSet({
        'Environment': ['Production'],
        'Application': ['MyApp'],
      }),
    });

    /** Output EC2 instance ID for reference */
    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID',
    });
  }
}