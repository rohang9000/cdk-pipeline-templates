const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const ecs = require('aws-cdk-lib/aws-ecs');
const ecsPatterns = require('aws-cdk-lib/aws-ecs-patterns');
const iam = require('aws-cdk-lib/aws-iam');
const logs = require('aws-cdk-lib/aws-logs');

class AppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'AppVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'AppCluster', {
      vpc,
      clusterName: `${this.stackName}-cluster`,
      containerInsights: true,
    });

    // Create task execution role
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Create task role
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Create log group
    const logGroup = new logs.LogGroup(this, 'AppLogGroup', {
      logGroupName: `/ecs/${this.stackName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Fargate service with Application Load Balancer
    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'AppService', {
      cluster,
      serviceName: `${this.stackName}-service`,
      cpu: 256,
      memoryLimitMiB: 512,
      // desiredCount: 2, // Removed due to @aws-cdk/aws-ecs-patterns:removeDefaultDesiredCount feature flag
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('nginx:latest'),
        containerName: 'app-container',
        containerPort: 80,
        executionRole: taskExecutionRole,
        taskRole: taskRole,
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'ecs',
          logGroup: logGroup,
        }),
        environment: {
          'ENVIRONMENT': 'production',
          'APP_NAME': this.stackName,
        },
      },
      publicLoadBalancer: true,
      listenerPort: 80,
    });

    // Configure health check
    fargateService.targetGroup.configureHealthCheck({
      path: '/',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // Configure auto scaling
    const scalableTarget = fargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 10,
    });

    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80,
    });

    // Outputs
    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
    });

    new cdk.CfnOutput(this, 'ServiceName', {
      value: fargateService.service.serviceName,
      description: 'ECS Service Name',
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS Name',
    });

    new cdk.CfnOutput(this, 'ServiceURL', {
      value: `http://${fargateService.loadBalancer.loadBalancerDnsName}`,
      description: 'Application URL',
    });
  }
}

module.exports = { AppStack };