import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../lib/pipeline-stack';

test('Pipeline Stack Created', () => {
  const app = new cdk.App();
  const stack = new PipelineStack(app, 'TestS3SourcePipelineStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Name: 'S3SourcePipeline'
  });
  
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
});
