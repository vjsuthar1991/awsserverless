import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { SellerService } from '../service/sellerService';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { SellerRepository } from "../repository/sellerRepository";

const service = new SellerService(new SellerRepository());

export const JoinSellerProgram = middy((event: APIGatewayProxyEventV2) => {
    return service.JoinSellerProgram(event);
}).use(jsonBodyParser());

export const GetPaymentMethods = middy((event: APIGatewayProxyEventV2) => {
    return service.GetPaymentMethods(event);
}).use(jsonBodyParser());

export const EditPaymentMethods = middy((event: APIGatewayProxyEventV2) => {
    return service.EditPaymentMethods(event);
}).use(jsonBodyParser());