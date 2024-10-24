import { APIGatewayProxyEventV2 } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CartService } from '../service/cartService';
import { container } from 'tsyringe';

const cartService = container.resolve(CartService);

export const CollectPayment = middy((event: APIGatewayProxyEventV2) => {
    return cartService.CollectPayment(event);
}).use(jsonBodyParser());

export const PlaceOrder = middy((event: APIGatewayProxyEventV2) => {
    return cartService.PlaceOrder(event);
}).use(jsonBodyParser());