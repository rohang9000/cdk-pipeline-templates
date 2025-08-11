#!/usr/bin/env python3
import aws_cdk as cdk
from ecsdeploy.pipeline_stack import PipelineStack

app = cdk.App()

PipelineStack(app, "ECSDeployPipelineStack", env=cdk.Environment(
    account=app.node.try_get_context("account"),
    region=app.node.try_get_context("region")
))

app.synth()
