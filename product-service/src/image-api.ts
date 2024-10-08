import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { v4 as uuid } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    // Grab the fileName from queryString
    const file = event.queryStringParameters?.file;
    if (!file) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing 'file' query parameter" })
        };
    }
    // Give unique name to the file
    const fileName = `${uuid()}__${file}`;
    // Create S3 params
    const s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        ContentType: "image/jpeg"
    };
    // Create a command
    const command = new PutObjectCommand(s3Params);
    // Get signed URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("UPLOAD URL:", s3Params, url);
    // Return it back to client for upload image
    return {
        statusCode: 200,
        body: JSON.stringify({
            url,
            Key: fileName
        })
    };
};
