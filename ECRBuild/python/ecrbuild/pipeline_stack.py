"""
Pipeline stack with multi-stage deployment.
"""
import aws_cdk as cdk
from aws_cdk import pipelines, aws_iam as iam, aws_codebuild as codebuild
from constructs import Construct
from .app_stack import AppStack

class AppStage(cdk.Stage):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        AppStack(self, "AppStack")

class PipelineStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        pipeline = pipelines.CodePipeline(
            self, "Pipeline",
            pipeline_name="ECRBuildPipeline",
            synth=pipelines.ShellStep(
                "Synth",
                input=pipelines.CodePipelineSource.git_hub(
                    "OWNER/REPO", "main",
                    authentication=cdk.SecretValue.secrets_manager("github-token")
                ),
                commands=[
                    "pip install -r requirements.txt",
                    "npx cdk synth"
                ]
            ,
            synth_code_build_defaults=pipelines.CodeBuildOptions(
                build_environment=codebuild.BuildEnvironment(
                    build_image=codebuild.LinuxBuildImage.STANDARD_7_0
                ),
                role_policy=[
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=[
                            "ec2:DescribeAvailabilityZones",
                            "ec2:DescribeVpcs",
                            "ec2:DescribeSubnets",
                            "ec2:DescribeRouteTables",
                            "ec2:DescribeSecurityGroups",
                            "ssm:GetParameter",
                            "ssm:GetParameters"
                        ],
                        resources=["*"]
                    )
                ]
            ),
            self_mutation_code_build_defaults=pipelines.CodeBuildOptions(
                build_environment=codebuild.BuildEnvironment(
                    build_image=codebuild.LinuxBuildImage.STANDARD_7_0
                )
            )
        )
        ,
            synth_code_build_defaults=pipelines.CodeBuildOptions(
                build_environment=codebuild.BuildEnvironment(
                    build_image=codebuild.LinuxBuildImage.STANDARD_7_0
                ),
                role_policy=[
                    iam.PolicyStatement(
                        effect=iam.Effect.ALLOW,
                        actions=[
                            "ec2:DescribeAvailabilityZones",
                            "ec2:DescribeVpcs",
                            "ec2:DescribeSubnets",
                            "ec2:DescribeRouteTables",
                            "ec2:DescribeSecurityGroups",
                            "ssm:GetParameter",
                            "ssm:GetParameters"
                        ],
                        resources=["*"]
                    )
                ]
            ),
            self_mutation_code_build_defaults=pipelines.CodeBuildOptions(
                build_environment=codebuild.BuildEnvironment(
                    build_image=codebuild.LinuxBuildImage.STANDARD_7_0
                )
            )
        )

        test_stage = pipeline.add_stage(AppStage(self, "Test", env=cdk.Environment(
            account=self.account, region=self.region
        )))

        test_stage.add_pre(pipelines.ShellStep("UnitTest", commands=[
            "pip install -r requirements.txt",
            "python -m pytest tests/ -v"
        ]))

        prod_stage = pipeline.add_stage(AppStage(self, "Prod", env=cdk.Environment(
            account=self.account, region=self.region
        )))

        prod_stage.add_pre(pipelines.ManualApprovalStep("PromoteToProd"))
