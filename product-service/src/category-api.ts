import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { CategoryService } from './service/category-service';
import { CategoryRepository } from './repository/category-repository';
import './utility';
import jsonBodyParser from "@middy/http-json-body-parser";
import middy from "@middy/core";

const service = new CategoryService(new CategoryRepository());

export const handler = middy((
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    const isRoot = event.pathParameters === null;
    switch (event.httpMethod.toLowerCase()) {
        case "post":
            if (isRoot) {
                return service.createCategory(event);
            }
            break;
        case "get":
            return isRoot ? service.getCategories(event) : service.getCategory(event);
        case "put":
            if (!isRoot) {
                return service.editCategory(event);
            }
        case "delete":
            if (!isRoot) {
                return service.deleteCategory(event);
            }
    }
    return service.ResponseWithError(event);
}).use(jsonBodyParser());