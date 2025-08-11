using Amazon.CDK;
using Constructs;

namespace ECRBuild
{
    public class AppStage : Stage
    {
        internal AppStage(Construct scope, string id, IStageProps props = null) : base(scope, id, props)
        {
            new AppStack(this, "AppStack");
        }
    }
}
