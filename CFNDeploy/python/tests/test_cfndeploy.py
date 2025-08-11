import aws_cdk as core
import aws_cdk.assertions as assertions
from cfndeploy.pipeline_stack import PipelineStack

def test_pipeline_stack_created():
    app = core.App()
    stack = PipelineStack(app, "TestCFNDeployPipelineStack")
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties("AWS::CodePipeline::Pipeline", {
        "Name": "CFNDeployPipeline"
    })
    
    template.resource_count_is("AWS::CodePipeline::Pipeline", 1)
