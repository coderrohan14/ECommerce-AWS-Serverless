import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface AppEventBusProps {
  publisherFunction: IFunction;
  targetQueue: IQueue;
}

export class AppEventBus extends Construct {
  constructor(scope: Construct, id: string, props: AppEventBusProps) {
    super(scope, id);

    // event bus
    const bus = new EventBus(this, "AppEventBus", {
      eventBusName: "AppEventBus",
    });

    const checkoutBasketRule = new Rule(this, "CheckoutBasketRule", {
      eventBus: bus,
      enabled: true,
      description: "When Basket microservice checks out the basket",
      eventPattern: {
        source: ["com.app.basket.checkoutBasket"],
        detailType: ["CheckoutBasket"],
      },
      ruleName: "CheckoutBasketRule",
    });

    checkoutBasketRule.addTarget(new SqsQueue(props.targetQueue));

    bus.grantPutEventsTo(props.publisherFunction);
  }
}
