using Amazon.CDK;
using Amazon.CDK.AWS.EC2;
using Amazon.CDK.AWS.AutoScaling;
using Amazon.CDK.AWS.CodeDeploy;
using Amazon.CDK.AWS.IAM;
using Constructs;

/// <summary>
/// Application infrastructure stack.
/// </summary>
namespace ECRBuild
{
    public class AppStack : Stack
    {
        internal AppStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            var vpc = new Vpc(this, "AppVPC", new VpcProps { MaxAzs = 2, NatGateways = 1 });
            
            var securityGroup = new SecurityGroup(this, "AppSecurityGroup", new SecurityGroupProps
            {
                Vpc = vpc, Description = "Security group for application instances", AllowAllOutbound = true
            });
            
            securityGroup.AddIngressRule(Peer.AnyIpv4(), Port.Tcp(80), "Allow HTTP");
            securityGroup.AddIngressRule(Peer.AnyIpv4(), Port.Tcp(22), "Allow SSH");
            
            var instanceRole = new Role(this, "InstanceRole", new RoleProps
            {
                AssumedBy = new ServicePrincipal("ec2.amazonaws.com"),
                ManagedPolicies = new[] {
                    ManagedPolicy.FromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
                    ManagedPolicy.FromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
                }
            });
            
            var launchTemplate = new LaunchTemplate(this, "AppLaunchTemplate", new LaunchTemplateProps
            {
                InstanceType = InstanceType.Of(InstanceClass.T3, InstanceSize.MICRO),
                MachineImage = MachineImage.LatestAmazonLinux2(),
                SecurityGroup = securityGroup, Role = instanceRole, UserData = UserData.ForLinux()
            });
            
            launchTemplate.UserData.AddCommands(
                "yum update -y", "yum install -y httpd ruby wget", "systemctl start httpd",
                "systemctl enable httpd", "echo '<h1>Hello from CDK Pipeline!</h1>' > /var/www/html/index.html",
                "cd /home/ec2-user", "wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install",
                "chmod +x ./install", "./install auto");
            
            var asg = new AutoScalingGroup(this, "AppASG", new AutoScalingGroupProps
            {
                Vpc = vpc, LaunchTemplate = launchTemplate, MinCapacity = 1, MaxCapacity = 3, DesiredCapacity = 2,
                VpcSubnets = new SubnetSelection { SubnetType = SubnetType.PRIVATE_WITH_EGRESS }
            });
            
            var application = new ServerApplication(this, "AppApplication", new ServerApplicationProps
            {
                ApplicationName = $"my-app-{this.StackName}"
            });
            
            var deploymentGroup = new ServerDeploymentGroup(this, "AppDeploymentGroup", new ServerDeploymentGroupProps
            {
                Application = application, DeploymentGroupName = "production", AutoScalingGroups = new[] { asg },
                InstallAgent = true, Ec2InstanceTags = new InstanceTagSet(new System.Collections.Generic.Dictionary<string, string[]>
                {
                    { "Environment", new[] { "production" } }
                })
            });
            
            new CfnOutput(this, "VPCId", new CfnOutputProps { Value = vpc.VpcId, Description = "VPC ID" });
            new CfnOutput(this, "ApplicationName", new CfnOutputProps { Value = application.ApplicationName, Description = "CodeDeploy Application Name" });
            new CfnOutput(this, "DeploymentGroupName", new CfnOutputProps { Value = deploymentGroup.DeploymentGroupName, Description = "CodeDeploy Deployment Group Name" });
        }
    }
}
