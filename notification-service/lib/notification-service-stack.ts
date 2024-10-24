import * as cdk from 'aws-cdk-lib';
import { SubscriptionFilter, Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { ServiceStack } from "./service-stack";
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class NotificationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // email queue
    const emailQueue = new Queue(this, "email_queue", {
      visibilityTimeout: cdk.Duration.seconds(120)
    });
    // sms queue
    const otpQueue = new Queue(this, "otp_queue", {
      visibilityTimeout: cdk.Duration.seconds(120)
    });
    // topic -> customer_email, customer_otp.
    const topic = new Topic(this, "notification_topic");
    this.addSubscription(topic, emailQueue, ["customer_email"]);
    this.addSubscription(topic, otpQueue, ["customer_otp"]);

    const { emailHandler, otpHandler } = new ServiceStack(
      this,
      "notification_service",
      {}
    );
    // email handler
    emailHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "sed:SendRawEmail"],
        resources: ["*"],
        effect: Effect.ALLOW,
      })
    );

    emailHandler.addEventSource(new SqsEventSource(emailQueue));
    // otp handler
    otpHandler.addEventSource(new SqsEventSource(otpQueue));

    // add subscription
    new cdk.CfnOutput(this, "NotificationTopic", {
      value: topic.topicArn,
      exportName: "notifySvcArn",
    });
  }

  addSubscription(topic: Topic, queue: Queue, allowlist: string[]) {
    topic.addSubscription(
      new SqsSubscription(queue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({
            allowlist
          })
        }
      })
    )
  }
}
