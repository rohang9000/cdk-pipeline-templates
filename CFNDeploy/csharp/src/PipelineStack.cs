using Amazon.CDK;
using Amazon.CDK.Pipelines;
using Constructs;

/// <summary>
/// Pipeline stack with multi-stage deployment.
/// </summary>
namespace CFNDeploy
{
    public class PipelineStack : Stack
    {
        internal PipelineStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            var pipeline = new CodePipeline(this, "Pipeline", new CodePipelineProps
            {
                PipelineName = "CFNDeployPipeline",
                Synth = new ShellStep("Synth", new ShellStepProps
                {
                    Input = CodePipelineSource.GitHub("aws-samples/aws-cdk-examples", "main"),
                    Commands = new[] { "dotnet build src", "npx cdk synth" }
                })
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
