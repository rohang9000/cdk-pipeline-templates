import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStack } from './app-stack';

/**
 * Application stage containing all application stacks.
 * Used by the pipeline to deploy to different environments.
 */
export class AppStage extends cdk.Stage {
  /**
   * Creates a new AppStage instance.
   * @param scope - The scope in which to define this construct
   * @param id - The scoped construct ID
   * @param props - Stage properties
   * @default undefined
   * @default undefined
   */
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    /** Application stack containing the main infrastructure */
    new AppStack(this, 'AppStack');
  }
}