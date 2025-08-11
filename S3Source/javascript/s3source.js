#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { PipelineStack } = require('./lib/pipeline-stack');

const app = new cdk.App();

new PipelineStack(app, 'S3SourcePipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();