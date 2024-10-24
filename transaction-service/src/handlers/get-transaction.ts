import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { APIGatewayEvent, Context, SQSEvent } from "aws-lambda";
import { DBOperation } from "./db-operation";

const dbOperation = new DBOperation();

export const getTransactionHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const queryString = "SELECT * FROM transactions LIMIT 500";
    const result = await dbOperation.executeQuery(queryString, []);
    if (result && result.rowCount !== null && result.rowCount > 0) {
      return {
        statusCode: 201,
        body: JSON.stringify({ transactions: result.rows[0] }),
      };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "transactions not found!" }),
    };
  }
).use(jsonBodyParser());
