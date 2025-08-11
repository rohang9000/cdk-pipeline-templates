const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const autoscaling = require('aws-cdk-lib/aws-autoscaling');
const codedeploy = require('aws-cdk-lib/aws-codedeploy');
const iam = require('aws-cdk-lib/aws-iam');

class AppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'AppVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create security group
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

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH access'
    );

    // Create IAM role for EC2 instances
    const instanceRole = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // Create instance profile
    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [instanceRole.roleName],
    });

    // Create launch template
    const launchTemplate = new ec2.LaunchTemplate(this, 'AppLaunchTemplate', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup,
      role: instanceRole,
      userData: ec2.UserData.forLinux(),
    });

    launchTemplate.userData.addCommands(
      'yum update -y',
      'yum install -y httpd',
      'systemctl start httpd',
      'systemctl enable httpd',
      'echo "<h1>Hello from CDK Pipeline!</h1>" > /var/www/html/index.html',
      'yum install -y ruby wget',
      'cd /home/ec2-user',
      'wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install',
      'chmod +x ./install',
      './install auto'
    );

    // Create Auto Scaling Group
    const asg = new autoscaling.AutoScalingGroup(this, 'AppASG', {
      vpc,
      launchTemplate,
      minCapacity: 1,
      maxCapacity: 3,
      desiredCapacity: 2,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Create CodeDeploy application
    const application = new codedeploy.ServerApplication(this, 'AppApplication', {
      applicationName: `my-app-${this.stackName}`,
    });

    // Create CodeDeploy deployment group
    const deploymentGroup = new codedeploy.ServerDeploymentGroup(this, 'AppDeploymentGroup', {
      application,
      deploymentGroupName: 'production',
      autoScalingGroups: [asg],
      installAgent: true,
      ec2InstanceTags: new codedeploy.InstanceTagSet({
        'Environment': ['production'],
      }),
    });

    // Outputs
    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'ApplicationName', {
      value: application.applicationName,
      description: 'CodeDeploy Application Name',
    });

    new cdk.CfnOutput(this, 'DeploymentGroupName', {
      value: deploymentGroup.deploymentGroupName,
      description: 'CodeDeploy Deployment Group Name',
    });
  }
}

module.exports = { AppStack };