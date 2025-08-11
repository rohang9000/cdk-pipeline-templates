package com.example;

import org.junit.jupiter.api.Test;
import software.amazon.awscdk.App;
import software.amazon.awscdk.assertions.Template;

public class PipelineTest {
    @Test
    public void testPipelineStackCreated() {
        App app = new App();
        PipelineStack stack = new PipelineStack(app, "TestECRBuildPipelineStack", null);
        Template template = Template.fromStack(stack);

        template.hasResourceProperties("AWS::CodePipeline::Pipeline", 
            java.util.Map.of("Name", "ECRBuildPipeline"));
        template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
    }
}
