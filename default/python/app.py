#!/usr/bin/env python3
"""
CDK application entry point for default pipeline template.
Creates and configures the pipeline stack.
"""

import aws_cdk as cdk
from default.pipeline_stack import PipelineStack

# CDK application instance
app = cdk.App()

# Default pipeline stack with GitHub source
PipelineStack(app, "defaultPipelineStack", env=cdk.Environment(
    account=app.node.try_get_context("account"),
    region=app.node.try_get_context("region")
))

app.synth()
