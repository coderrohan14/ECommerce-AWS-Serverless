import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppDatabase } from "./database";
import { AppMicroservices } from "./microservices";
import { AppApiGateway } from "./apiGateway";
import { AppEventBus } from "./eventbus";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { AppQueue } from "./queue";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new AppDatabase(this, "Database");

    const microservices = new AppMicroservices(this, "Microservices", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable,
    });

    const apiGateway = new AppApiGateway(this, "ApiGateway", {
      productFunction: microservices.productFunction,
      basketFunction: microservices.basketFunction,
      orderFunction: microservices.orderFunction,
    });

    const queue = new AppQueue(this, "Queue", {
      consumer: microservices.orderFunction,
    });

    const eventBus = new AppEventBus(this, "EventBus", {
      publisherFunction: microservices.basketFunction,
      targetQueue: queue.orderQueue,
    });
  }
}
