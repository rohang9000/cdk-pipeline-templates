using Amazon.CDK;
using Constructs;

namespace ExternalSource
{
    public class AppStage : Stage
    {
        internal AppStage(Construct scope, string id, IStageProps props = null) : base(scope, id, props)
        {
            new AppStack(this, "AppStack");
        }
    }
}
