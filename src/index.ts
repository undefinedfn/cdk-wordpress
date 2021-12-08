import { Construct } from "constructs";
import { Vpc, IVpc, Port, InstanceType, InstanceClass, InstanceSize } from "aws-cdk-lib/aws-ec2";
import { DatabaseInstanceEngine, MysqlEngineVersion, DatabaseInstance } from "aws-cdk-lib/aws-rds";
import { Cluster, ContainerImage, Secret, EcsOptimizedImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedEc2Service } from "aws-cdk-lib/aws-ecs-patterns";
import { FileSystem } from "aws-cdk-lib/aws-efs";
import { Duration } from "aws-cdk-lib";

export interface ServerlessWordpressProps {
    vpc?: IVpc;
    secret?: Secret;
    database?: DatabaseInstance;
    cluster?: Cluster;
}

export class ServerlessWordpress extends Construct {
    readonly vpcid: string;

    constructor(scope: Construct, id: string, props: ServerlessWordpressProps = {}) {
        super(scope, id);

        //Check to see if a VPC was passed in, otherwise make one
        const vpc = props.vpc ?? new Vpc(this, "Vpc", { maxAzs: 3, natGateways: 1 });

        //Make the MYSQL Database
        const database =
            props.database ??
            new DatabaseInstance(this, "Database", {
                engine: DatabaseInstanceEngine.mysql({
                    version: MysqlEngineVersion.VER_8_0_21,
                }),
                vpc,
                deleteAutomatedBackups: true,
                instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
                allocatedStorage: 10,
            });

        //Make the ECS Cluster
        const cluster = props.cluster ?? new Cluster(this, "EcsCluster", { vpc });

        const autoScalingGroup = cluster.addCapacity("ASG", {
            instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.SMALL),
            maxCapacity: 3,
            machineImage: EcsOptimizedImage.amazonLinux2(),
        });
        autoScalingGroup.scaleOnCpuUtilization("KeepCpuHalfwayLoaded", {
            targetUtilizationPercent: 50,
        });

        const AppService = new ApplicationLoadBalancedEc2Service(this, "Service", {
            cluster,
            memoryLimitMiB: 512,
            taskImageOptions: {
                image: ContainerImage.fromRegistry("wordpress"),
                environment: {
                    WORDPRESS_DB_NAME: "wordpress",
                },
                secrets: {
                    WORDPRESS_DB_HOST: Secret.fromSecretsManager(database.secret!, "host"),
                    WORDPRESS_DB_USER: Secret.fromSecretsManager(database.secret!, "username"),
                    WORDPRESS_DB_PASSWORD: Secret.fromSecretsManager(database.secret!, "password"),
                },
            },
            desiredCount: 2,
        });

        const scaling = AppService.service.autoScaleTaskCount({
            maxCapacity: 6,
        });
        scaling.scaleOnCpuUtilization("CpuScaling", {
            targetUtilizationPercent: 50,
        });
        AppService.targetGroup.healthCheck = {
            path: "/wp-includes/images/blank.gif",
            interval: Duration.minutes(1),
        };

        database.connections.allowFrom(AppService.cluster.connections, Port.tcp(3306));

        const fileSystem = new FileSystem(this, "FileSystem", {
            vpc,
            encrypted: true,
        });

        fileSystem.connections.allowFrom(autoScalingGroup.connections.connections, Port.tcp(2049));

        const volumeName = "efs";
        AppService.taskDefinition.addVolume({
            name: volumeName,
            efsVolumeConfiguration: {
                fileSystemId: fileSystem.fileSystemId,
            },
        });

        AppService.taskDefinition.defaultContainer?.addMountPoints({
            containerPath: "/var/www/html",
            readOnly: false,
            sourceVolume: volumeName,
        });

        this.vpcid = vpc.vpcId;
    }
}
