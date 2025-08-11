using Amazon.CDK;

namespace Default
{
    /// <summary>
    /// CDK application entry point for default pipeline template.
    /// Creates and configures the pipeline stack.
    /// </summary>
    sealed class Program
    {
        /// <summary>
        /// Main method to initialize and synthesize the CDK application.
        /// </summary>
        /// <param name="args">Command line arguments</param>
        public static void Main(string[] args)
        {
            // CDK application instance
            var app = new App();
            
            // Default pipeline stack with GitHub source
            new PipelineStack(app, "DefaultPipelineStack", new StackProps
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
