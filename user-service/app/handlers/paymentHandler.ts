import { APIGatewayProxyEventV2 } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

export const CreatePayment = middy((event: APIGatewayProxyEventV2) => {
    
}).use(jsonBodyParser());