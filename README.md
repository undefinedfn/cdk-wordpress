# Wordpress CDK Construct

Represents all the resources needed to run a wordpress instance, including:

-   ecs cluster & task
-   msyql database (RDS)
-   Persistent file storage via EFS.

## Usage

Install the wordpress cdk component

```
$ npm install @undefinedfn/wordpress-cdk
```

```typescript
import { WordPress } from "cdk-wordpress";

const wordpress = new WordPress(stack, "WordPressEcs");

// Get WordPress endpoint
new CfnOutput(stack, "Endpoint", { value: wordpress.endpoint });
```

When ready to deploy, use the normal cdk commands

```
cdk synth
```

```
cdk deploy
```
