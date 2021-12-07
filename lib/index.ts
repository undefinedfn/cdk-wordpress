import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ServerlessDatabaseProps {
  // Define construct properties here
}

export class ServerlessDatabase extends Construct {

  constructor(scope: Construct, id: string, props: ServerlessDatabaseProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'ServerlessDatabaseQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
