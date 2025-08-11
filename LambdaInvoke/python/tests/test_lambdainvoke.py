import aws_cdk as core
import aws_cdk.assertions as assertions
from lambdainvoke.pipeline_stack import PipelineStack

def test_pipeline_stack_created():
    app = core.App()
    stack = PipelineStack(app, "TestLambdaInvokePipelineStack")
    template = assertions.Template.from_stack(stack)

    template.has_resource_properties("AWS::CodePipeline::Pipeline", {
        "Name": "LambdaInvokePipeline"
    })
    
    template.resource_count_is("AWS::CodePipeline::Pipeline", 1)
