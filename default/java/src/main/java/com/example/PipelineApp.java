package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Environment;
import software.amazon.awscdk.StackProps;

/**
 * CDK application entry point for default pipeline template.
 * Creates and configures the pipeline stack.
 */
public class PipelineApp {
    /**
     * Main method to initialize and synthesize the CDK application.
     * @param args Command line arguments
     */
    public static void main(final String[] args) {
        // CDK application instance
        App app = new App();
        
        // Default pipeline stack with GitHub source
        new PipelineStack(app, "defaultPipelineStack", StackProps.builder()
                .env(Environment.builder()
                        .account(System.getenv("CDK_DEFAULT_ACCOUNT"))
                        .region(System.getenv("CDK_DEFAULT_REGION"))
                        .build())
                .build());
        app.synth();
    }
}
