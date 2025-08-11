package com.example;

import org.junit.jupiter.api.Test;
import software.amazon.awscdk.App;
import software.amazon.awscdk.assertions.Template;

public class PipelineTest {
    @Test
    public void testPipelineStackCreated() {
        App app = new App();
        PipelineStack stack = new PipelineStack(app, "TestLambdaInvokePipelineStack", null);
        Template template = Template.fromStack(stack);

        template.hasResourceProperties("AWS::CodePipeline::Pipeline", 
            java.util.Map.of("Name", "LambdaInvokePipeline"));
        template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
    }
}
