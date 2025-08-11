package com.example;

/**
 * Application infrastructure stack.
 */

import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.services.autoscaling.AutoScalingGroup;
import software.amazon.awscdk.services.codedeploy.ServerApplication;
import software.amazon.awscdk.services.codedeploy.ServerDeploymentGroup;
import software.amazon.awscdk.services.codedeploy.InstanceTagSet;
import software.amazon.awscdk.services.ec2.*;
import software.amazon.awscdk.services.iam.ManagedPolicy;
import software.amazon.awscdk.services.iam.Role;
import software.amazon.awscdk.services.iam.ServicePrincipal;
import software.constructs.Construct;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

public class AppStack extends Stack {
    public AppStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        Vpc vpc = Vpc.Builder.create(this, "AppVPC").maxAzs(2).natGateways(1).build();
        
        SecurityGroup securityGroup = SecurityGroup.Builder.create(this, "AppSecurityGroup")
                .vpc(vpc).description("Security group for application instances").allowAllOutbound(true).build();
        
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), "Allow HTTP");
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), "Allow SSH");
        
        Role instanceRole = Role.Builder.create(this, "InstanceRole")
                .assumedBy(new ServicePrincipal("ec2.amazonaws.com"))
                .managedPolicies(Arrays.asList(
                        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
                        ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")))
                .build();
        
        LaunchTemplate launchTemplate = LaunchTemplate.Builder.create(this, "AppLaunchTemplate")
                .instanceType(InstanceType.of(InstanceClass.T3, InstanceSize.MICRO))
                .machineImage(MachineImage.latestAmazonLinux2())
                .securityGroup(securityGroup).role(instanceRole).userData(UserData.forLinux()).build();
        
        launchTemplate.getUserData().addCommands(
                "yum update -y", "yum install -y httpd ruby wget", "systemctl start httpd",
                "systemctl enable httpd", "echo '<h1>Hello from CDK Pipeline!</h1>' > /var/www/html/index.html",
                "cd /home/ec2-user", "wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install",
                "chmod +x ./install", "./install auto");
        
        AutoScalingGroup asg = AutoScalingGroup.Builder.create(this, "AppASG")
                .vpc(vpc).launchTemplate(launchTemplate).minCapacity(1).maxCapacity(3).desiredCapacity(2)
                .vpcSubnets(SubnetSelection.builder().subnetType(SubnetType.PRIVATE_WITH_EGRESS).build()).build();
        
        ServerApplication application = ServerApplication.Builder.create(this, "AppApplication")
                .applicationName("my-app-" + this.getStackName()).build();
        
        ServerDeploymentGroup deploymentGroup = ServerDeploymentGroup.Builder.create(this, "AppDeploymentGroup")
                .application(application).deploymentGroupName("production").autoScalingGroups(Collections.singletonList(asg))
                .installAgent(true).ec2InstanceTags(new InstanceTagSet(Map.of("Environment", Arrays.asList("production")))).build();
        
        CfnOutput.Builder.create(this, "VPCId").value(vpc.getVpcId()).description("VPC ID").build();
        CfnOutput.Builder.create(this, "ApplicationName").value(application.getApplicationName()).description("CodeDeploy Application Name").build();
        CfnOutput.Builder.create(this, "DeploymentGroupName").value(deploymentGroup.getDeploymentGroupName()).description("CodeDeploy Deployment Group Name").build();
    }
}
