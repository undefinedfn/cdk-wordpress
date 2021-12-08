import { App, Stack, CfnOutput } from "aws-cdk-lib";
import { ServerlessWordpress } from "./index";

export class IntegTesting {
    readonly stack: Stack[];

    constructor() {
        const app = new App();

        const env = {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: process.env.CDK_DEFAULT_REGION,
        };

        const stack = new Stack(app, "testing-stack", { env });

        const SLS = new ServerlessWordpress(stack, "ServerlessWordpressStack");

        new CfnOutput(stack, "VpcID", {
            value: SLS.vpcid,
        });

        this.stack = [stack];
    }
}
