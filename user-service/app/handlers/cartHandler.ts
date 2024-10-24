import { container } from "tsyringe";
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CartService } from "../service/cartService";

const cartService = container.resolve(CartService);

export const CreateCart = middy((event: APIGatewayProxyEventV2) => {
    return cartService.CreateCart(event);
}).use(jsonBodyParser());

export const UpdateCart = middy((event: APIGatewayProxyEventV2) => {
    return cartService.UpdateCart(event);
}).use(jsonBodyParser());

export const GetCart = middy((event: APIGatewayProxyEventV2) => {
    return cartService.GetCart(event);
}).use(jsonBodyParser());

export const DeleteCart = middy((event: APIGatewayProxyEventV2) => {
    return cartService.GetCart(event);
}).use(jsonBodyParser());