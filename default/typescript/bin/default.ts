#!/usr/bin/env node
/**
 * CDK application entry point for default pipeline template.
 * Creates and configures the pipeline stack.
 */
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';

/** CDK application instance */
const app = new cdk.App();

/** Default pipeline stack with GitHub source */
new PipelineStack(app, 'DefaultPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();