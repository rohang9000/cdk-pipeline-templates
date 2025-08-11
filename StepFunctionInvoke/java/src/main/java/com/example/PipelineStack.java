package com.example;

/**
 * Pipeline stack with multi-stage deployment.
 */

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.StackProps;
import software.amazon.awscdk.pipelines.CodePipeline;
import software.amazon.awscdk.pipelines.CodePipelineSource;
import software.amazon.awscdk.pipelines.ShellStep;
import software.amazon.awscdk.pipelines.ManualApprovalStep;
import software.constructs.Construct;
import java.util.Arrays;

public class PipelineStack extends Stack {
    public PipelineStack(final Construct scope, final String id, final StackProps props) {
        super(scope, id, props);

        CodePipeline pipeline = CodePipeline.Builder.create(this, "Pipeline")
                .pipelineName("StepFunctionInvokePipeline")
                .synth(ShellStep.Builder.create("Synth")
                        .input(CodePipelineSource.gitHub("aws-samples/aws-cdk-examples", "main"))
                        .commands(Arrays.asList("mvn compile", "npx cdk synth"))
                        .build())
                .build();

        AppStage testStage = new AppStage(this, "Test", software.amazon.awscdk.StageProps.builder()
                .env(software.amazon.awscdk.Environment.builder()
                        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                        .region(System.getenv("CDK_DEFAULT_REGION"))
                        .build())
                .build());

        pipeline.addStage(testStage).addPre(ShellStep.Builder.create("UnitTest")
                .commands(Arrays.asList("mvn test"))
                .build());

        AppStage prodStage = new AppStage(this, "Prod", software.amazon.awscdk.StageProps.builder()
                .env(software.amazon.awscdk.Environment.builder()
                        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                        .region(System.getenv("CDK_DEFAULT_REGION"))
                        .build())
                .build());

        pipeline.addStage(prodStage).addPre(new ManualApprovalStep("PromoteToProd"));
    }
}
