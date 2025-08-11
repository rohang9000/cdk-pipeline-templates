const cdk = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const { PipelineStack } = require('../lib/pipeline-stack');

test('Pipeline Stack Created', () => {
  const app = new cdk.App();
  const stack = new PipelineStack(app, 'TestCFNDeployPipelineStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
    Name: 'CFNDeployPipeline'
  });
});
