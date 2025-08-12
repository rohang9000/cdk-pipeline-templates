using Amazon.CDK;
using Amazon.CDK.AWS.CodeBuild;
using Amazon.CDK.AWS.IAM;
using Amazon.CDK.Pipelines;
using Constructs;

/// <summary>
/// Pipeline stack with multi-stage deployment.
/// </summary>
namespace Default
{
    public class PipelineStack : Stack
    {
        internal PipelineStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            var pipeline = new CodePipeline(this, "Pipeline", new CodePipelineProps
            {
                PipelineName = "defaultPipeline",
                Synth = new ShellStep("Synth", new ShellStepProps
                {
                    Input = CodePipelineSource.GitHub("OWNER/REPO", "main"),
                    Commands = new[] { "dotnet build src", "npx cdk synth" }
                }),
                SynthCodeBuildDefaults = new CodeBuildOptions
                {
                    BuildEnvironment = new BuildEnvironment
                    {
                        BuildImage = LinuxBuildImage.STANDARD_7_0
                    },
                    RolePolicy = new[]
                    {
                        new PolicyStatement(new PolicyStatementProps
                        {
                            Effect = Effect.ALLOW,
                            Actions = new[]
                            {
                                "ec2:DescribeAvailabilityZones",
                                "ec2:DescribeVpcs",
                                "ec2:DescribeSubnets",
                                "ec2:DescribeRouteTables",
                                "ec2:DescribeSecurityGroups",
                                "ssm:GetParameter",
                                "ssm:GetParameters"
                            },
                            Resources = new[] { "*" }
                        })
                    }
                },
                SelfMutationCodeBuildDefaults = new CodeBuildOptions
                {
                    BuildEnvironment = new BuildEnvironment
                    {
                        BuildImage = LinuxBuildImage.STANDARD_7_0
                    }
                }
            });

            var testStage = pipeline.AddStage(new AppStage(this, "Test", new StageProps
            {
                Env = new Amazon.CDK.Environment
                {
                    Account = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_ACCOUNT"),
                    Region = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_REGION")
                }
            }));

            testStage.AddPre(new ShellStep("UnitTest", new ShellStepProps
            {
                Commands = new[] { "dotnet test src" }
            }));

            var prodStage = pipeline.AddStage(new AppStage(this, "Prod", new StageProps
            {
                Env = new Amazon.CDK.Environment
                {
                    Account = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_ACCOUNT"),
                    Region = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_REGION")
                }
            }));

            prodStage.AddPre(new ManualApprovalStep("PromoteToProd"));
        }
    }
}
