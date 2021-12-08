import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ServerlessWordpress } from "../lib/index";

//Tests For VPC
test("VPC For Serverless Database Created", () => {
    //Make CDK app, and inject it into the cloudformation stack
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack");

    //Does not actually create a resource
    new ServerlessWordpress(stack, "MyTestConstruct");
    //This will give us a serialized representation of the Cloudformation
    const template = Template.fromStack(stack);
    //Ensure we have a VPC Resource
    template.hasResource("AWS::EC2::VPC", {});
});
