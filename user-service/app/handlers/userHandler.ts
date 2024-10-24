import { container } from "tsyringe";
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { UserService } from '../service/userService';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

const service = container.resolve(UserService);

export const SignUp = middy((event: APIGatewayProxyEventV2) => {
    return service.CreateUser(event);
}).use(jsonBodyParser());

export const Login = middy((event: APIGatewayProxyEventV2) => {
    return service.UserLogin(event);
}).use(jsonBodyParser());

export const Verify = middy((event: APIGatewayProxyEventV2) => {
    return service.VerifyUser(event);
}).use(jsonBodyParser());

export const CreateProfile = middy((event: APIGatewayProxyEventV2) => {
    return service.CreateProfile(event);
}).use(jsonBodyParser());

export const EditProfile = middy((event: APIGatewayProxyEventV2) => {
    return service.EditProfile(event);
}).use(jsonBodyParser());

export const GetProfile = middy((event: APIGatewayProxyEventV2) => {
    return service.GetProfile(event);
}).use(jsonBodyParser());