import { SQSClient } from "@aws-sdk/client-sqs";

export const handler = async (event: SQSClient) => {
    console.log("SNS Topic Listener through SQS");
    console.log(event);

    return {
        statusCode: 200,
        body: JSON.stringify("Listening to Queue")
    };
}