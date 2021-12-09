import { Template } from "aws-cdk-lib/assertions";
import { IntegTesting } from "../src/integ.default";

describe("Resources Should Be Created", () => {
    //Tests For VPC
    test("VPC For Wordpress Task Is Created", () => {
        const integ = new IntegTesting();

        integ.stack.map((stack) => {
            const template = Template.fromStack(stack);
            template.hasResource("AWS::EC2::VPC", {});
        });
    });

    test("Database Resource Is Created", () => {
        const integ = new IntegTesting();

        integ.stack.map((stack) => {
            const template = Template.fromStack(stack);
            template.hasResource("AWS::RDS::DBInstance", {});
        });
    });

    test("ECS Cluster Resource is Created", () => {
        const integ = new IntegTesting();

        integ.stack.map((stack) => {
            const template = Template.fromStack(stack);
            template.hasResource("AWS::ECS::Cluster", {});
        });
    });
});
