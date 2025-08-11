"""
Application infrastructure stack.
"""
import aws_cdk as cdk
from aws_cdk import aws_ec2 as ec2, aws_autoscaling as autoscaling, aws_codedeploy as codedeploy, aws_iam as iam
from constructs import Construct

class AppStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Create VPC
        vpc = ec2.Vpc(self, "AppVPC", max_azs=2, nat_gateways=1)
        
        # Create security group
        security_group = ec2.SecurityGroup(
            self, "AppSecurityGroup",
            vpc=vpc,
            description="Security group for application instances",
            allow_all_outbound=True
        )
        
        security_group.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(80), "Allow HTTP")
        security_group.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(22), "Allow SSH")
        
        # Create IAM role
        instance_role = iam.Role(
            self, "InstanceRole",
            assumed_by=iam.ServicePrincipal("ec2.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("CloudWatchAgentServerPolicy"),
                iam.ManagedPolicy.from_aws_managed_policy_name("AmazonSSMManagedInstanceCore")
            ]
        )
        
        # Create launch template
        launch_template = ec2.LaunchTemplate(
            self, "AppLaunchTemplate",
            instance_type=ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            machine_image=ec2.MachineImage.latest_amazon_linux2(),
            security_group=security_group,
            role=instance_role,
            user_data=ec2.UserData.for_linux()
        )
        
        launch_template.user_data.add_commands(
            "yum update -y",
            "yum install -y httpd ruby wget",
            "systemctl start httpd",
            "systemctl enable httpd",
            "echo '<h1>Hello from CDK Pipeline!</h1>' > /var/www/html/index.html",
            "cd /home/ec2-user",
            "wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install",
            "chmod +x ./install",
            "./install auto"
        )
        
        # Create Auto Scaling Group
        asg = autoscaling.AutoScalingGroup(
            self, "AppASG",
            vpc=vpc,
            launch_template=launch_template,
            min_capacity=1,
            max_capacity=3,
            desired_capacity=2,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PRIVATE_WITH_EGRESS)
        )
        
        # Create CodeDeploy application
        application = codedeploy.ServerApplication(
            self, "AppApplication",
            application_name=f"my-app-{self.stack_name}"
        )
        
        # Create deployment group
        deployment_group = codedeploy.ServerDeploymentGroup(
            self, "AppDeploymentGroup",
            application=application,
            deployment_group_name="production",
            auto_scaling_groups=[asg],
            install_agent=True,
            ec2_instance_tags=codedeploy.InstanceTagSet({"Environment": ["production"]})
        )
        
        # Outputs
        cdk.CfnOutput(self, "VPCId", value=vpc.vpc_id, description="VPC ID")
        cdk.CfnOutput(self, "ApplicationName", value=application.application_name, description="CodeDeploy Application Name")
        cdk.CfnOutput(self, "DeploymentGroupName", value=deployment_group.deployment_group_name, description="CodeDeploy Deployment Group Name")
