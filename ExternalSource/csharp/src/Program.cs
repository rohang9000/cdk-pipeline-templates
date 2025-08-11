using Amazon.CDK;

/// <summary>
/// CDK application entry point.
/// </summary>
namespace ExternalSource
{
    sealed class Program
    {
        public static void Main(string[] args)
        {
            var app = new App();
            
            new PipelineStack(app, "ExternalSourcePipelineStack", new StackProps
            {
                Env = new Amazon.CDK.Environment
                {
                    Account = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_ACCOUNT"),
                    Region = System.Environment.GetEnvironmentVariable("CDK_DEFAULT_REGION"),
                }
            });
            
            app.Synth();
        }
    }
}
