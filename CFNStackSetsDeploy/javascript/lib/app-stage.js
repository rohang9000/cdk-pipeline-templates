const cdk = require('aws-cdk-lib');
const { AppStack } = require('./app-stack');

class AppStage extends cdk.Stage {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    new AppStack(this, 'AppStack');
  }
}

module.exports = { AppStage };