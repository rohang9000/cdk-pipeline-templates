#!/usr/bin/env python3
import aws_cdk as cdk
from lambdainvoke.pipeline_stack import PipelineStack

app = cdk.App()

PipelineStack(app, "LambdaInvokePipelineStack", env=cdk.Environment(
    account=app.node.try_get_context("account"),
    region=app.node.try_get_context("region")
))

app.synth()
