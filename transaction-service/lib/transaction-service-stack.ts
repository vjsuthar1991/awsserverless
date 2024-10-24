import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Topic, SubscriptionFilter } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { join } from "path";
import { ServiceStack } from "./service-stack";
import { ApiGatewayStack } from "./api-gateway-stack";

export class TransactionServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const orderQueue = new Queue(this, "order_queue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const orderTopic = Topic.fromTopicArn(
      this,
      "order-consume-topic",
      cdk.Fn.importValue("customer-topic")
    );

    orderTopic.addSubscription(
      new SqsSubscription(orderQueue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({
            allowlist: ["place_order"],
          }),
        },
      })
    );

    // handler
    const { createOrder, getOrder, getOrders, getTransaction } =
      new ServiceStack(this, "transaction-service", {});
    createOrder.addEventSource(new SqsEventSource(orderQueue));

    new ApiGatewayStack(this, "transaction-api-gateway", {
      createOrder,
      getOrders,
      getOrder,
      getTransaction,
    });
  }
}
