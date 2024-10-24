import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SucessResponse, ErrorResponse } from '../utility/response';
import { autoInjectable } from "tsyringe";
import { CartRepository } from "../repository/cartRepository";
import { VerifyToken } from "../utility/password";
import { plainToClass } from "class-transformer";
import { AppValidationError } from "../utility/errors";
import { CartInput, UpdateCartInput } from "../models/dto/CartInput";
import { CartItemModel } from "../models/dto/CartItemsModel";
import { PullData } from "../message-queue";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { UserRepository } from "../repository/userRepository";
import { APPLICATION_FEE, CreatePaymentSession, RetrivePayment, STRIPE_FEE } from "../utility/payment";

@autoInjectable()
export class CartService {
    repository: CartRepository;
    constructor(repository: CartRepository) {
        this.repository = repository;
    }
    // Cart Section
    async CreateCart(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const input = plainToClass(CartInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);

            let currentCart = await this.repository.findShoppingCart(payload.user_id);
            if (!currentCart)
                currentCart = await this.repository.createShoppingCart(payload.user_id);

            if (!currentCart) {
                return ErrorResponse(500, "create cart is failed!");
            }
            // find the item if exist
            let currentProduct = await this.repository.findCartItemByProductId(
                input.productId
            );

            if (currentProduct) {
                // if exist update the qty
                await this.repository.updateCartItemByProductId(
                    input.productId,
                    (currentProduct.item_qty += input.qty)
                );
            } else {
                const { data, status } = await PullData({
                    action: "PULL_PRODUCT_DATA",
                    productId: input.productId
                });

                if (status !== 200) {
                    return ErrorResponse(500, "failed to add to cart!");
                }

                let cartItem = data.data as CartItemModel;
                cartItem.cart_id = currentCart.cart_id;
                cartItem.item_qty = input.qty;
                // Finally create cart item
                await this.repository.createCartItem(cartItem);
            }

            const cartItems = await this.repository.findCartItemByCartId(currentCart.cart_id);
            return SucessResponse(cartItems);
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetCart(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const cartItems = await this.repository.findCartItems(payload.user_id);

            const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.item_qty, 0);

            const appFee = APPLICATION_FEE(totalAmount) + STRIPE_FEE(totalAmount);
            return SucessResponse({ cartItems, totalAmount, appFee });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async UpdateCart(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");
            const itemId = Number(event.pathParameters.id);
            const input = plainToClass(UpdateCartInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);

            const cartItem = await this.repository.updateCartItemById(itemId, input.qty);
            if (cartItem) {
                return SucessResponse(cartItem);
            }
            return ErrorResponse(404, "Item does no exist!!");
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async DeleteCart(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");
            const itemId = Number(event.pathParameters.id);
            const deletedItem = await this.repository.deleteCartItem(itemId);
            if (deletedItem) {
                return SucessResponse(deletedItem);
            }
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async CollectPayment(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const { stripe_id, email, phone } = await new UserRepository().getUserProfie(payload.user_id);

            const cartItems = await this.repository.findCartItems(payload.user_id);

            const total = cartItems.reduce(
                (sum, item) => sum + item.price * item.item_qty, 0
            );

            const appFee = APPLICATION_FEE(total);
            const stripeFee = STRIPE_FEE(total);
            const amount = total + appFee + stripeFee;

            // initialize payment gateway
            const { secret, publishableKey, customerId, paymentId } = await CreatePaymentSession({
                amount,
                email,
                phone,
                customerId: stripe_id
            })

            await new UserRepository().updateUserPayment({
                userId: payload.user_id,
                paymentId,
                customerId
            });
            // authenticate payment confirmation

            return SucessResponse({ secret, publishableKey });

        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async PlaceOrder(event: APIGatewayProxyEventV2) {
        const token = event.headers.authorization;
        const payload = await VerifyToken(token);
        if (!payload) return ErrorResponse(403, "authorization failed");
        const { payment_id } = await new UserRepository().getUserProfie(payload.user_id);

        const paymentInfo = await RetrivePayment(payment_id);
        console.log(paymentInfo, "paymentInfo");
        if (paymentInfo.status === "succeeded") {
            // get cart items
            const cartItems = await this.repository.findCartItems(payload.user_id);
            console.log(cartItems, "cartItems");
            // Send SNS topic to create Order [Transaction MS]
            const params = {
                Message: JSON.stringify({
                    userId: payload.user_id,
                    items: cartItems,
                    transaction: paymentInfo,
                }),
                TopicArn: process.env.SNS_TOPIC,
                MessageAttributes: {
                    actionType: {
                        DataType: "String",
                        StringValue: "place_order",
                    },
                },
            };
            const snsClient = new SNSClient();
            const command = new PublishCommand(params);

            console.log(JSON.stringify(params));
            // Send tentative message to user

            const response = await snsClient.send(command);
            console.log(response);
            return SucessResponse({ msg: "success", params });
        }
        return ErrorResponse(503, new Error("Payment Failed!!"));
    }
}