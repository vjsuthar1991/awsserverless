import { BASE_URL, TRANSACTION_URL } from "../utils/AppConst";
import { ResponseModel } from "../types";
import { axiosAuth, handleResponse } from "./common";

export const FetchCartItemsApi = async (
  token: string
): Promise<ResponseModel> => {
  try {
    const auth = axiosAuth(token);
    const response = await auth.get(`${BASE_URL}/cart`);
    return handleResponse(response);
  } catch (error) {
    console.log(error);
    return {
      msg: "error occured",
    };
  }
};

export const FetchOrderItemsApi = async (
  token: string
): Promise<ResponseModel> => {
  try {
    const auth = axiosAuth(token);
    const response = await auth.get(`${TRANSACTION_URL}/cart`);
    return handleResponse(response);
  } catch (error) {
    console.log(error);
    return {
      msg: "error occured",
    };
  }
};
