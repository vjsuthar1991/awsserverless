import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SucessResponse, ErrorResponse } from '../utility/response';
import { UserRepository } from '../repository/userRepository';
import { autoInjectable } from "tsyringe";
import { plainToClass } from "class-transformer";
import { SignupInput } from "../models/dto/SignupInput";
import { AppValidationError } from "../utility/errors";
import {
    GetSalt,
    GetHashedPassword,
    ValidatePassword,
    GetToken,
    VerifyToken
} from "../utility/password";
import { LoginInput } from '../models/dto/LoginInput';
import { VerficationInput } from '../models/dto/Updateinput';
import { GenerateAccessCode, SendVerificationCode } from '../utility/notification';
import { TimeDifference } from '../utility/dateHelper';
import { ProfileInput } from "../models/dto/Addressinput";

@autoInjectable()
export class UserService {
    repository: UserRepository;
    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    async ResponseWithError(event: APIGatewayProxyEventV2) {
        return ErrorResponse(404, "requested method is not supported!");
    }
    // User Creation, Validation & Login
    async CreateUser(event: APIGatewayProxyEventV2) {
        try {
            const input = plainToClass(SignupInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);

            const salt = await GetSalt();
            const hashedPassword = await GetHashedPassword(input.password, salt);
            const data = await this.repository.createAccount({
                email: input.email,
                password: hashedPassword,
                phone: input.phone,
                userType: "BUYER",
                salt: salt,
            });

            return SucessResponse(data);
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async UserLogin(event: APIGatewayProxyEventV2) {
        try {
            const input = plainToClass(LoginInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);
            const data = await this.repository.findAccount(input.email);
            const verified = await ValidatePassword(
                input.password,
                data.password,
                data.salt
            );
            if (!verified) {
                throw new Error("password does not match!");
            }
            const token = GetToken(data);

            return SucessResponse({ token });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetVerificationToken(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");
            const { code, expiry } = GenerateAccessCode();
            // save on DB to confirm verification
            await this.repository.updateVerficationCode(payload.user_id, code, expiry);
            console.log(code, expiry);
            //const response = await SendVerificationCode(code, payload.phone);
            return SucessResponse({
                message: "verification code is sent to your registered mobile number!",
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async VerifyUser(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const input = plainToClass(VerficationInput, event.body);
            const error = await AppValidationError(input);

            const { verification_code, expiry } = await this.repository.findAccount(payload.email);
            //find the user account
            if (verification_code === parseInt(input.code)) {
                const currentTime = new Date();
                const diff = TimeDifference(expiry, currentTime.toISOString(), "m");
                if (diff > 0) {
                    console.log("verified successfully!!");
                    await this.repository.updateVerifyUser(payload.user_id);
                } else {
                    return ErrorResponse(403, "verification code is expired!");
                }
            }
            return SucessResponse({ message: "User Verified!" });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    // User profile
    async CreateProfile(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const input = plainToClass(ProfileInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);

            await this.repository.createProfile(payload.user_id, input);
            return SucessResponse({ message: "Profile Created!" });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetProfile(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const result = await this.repository.getUserProfie(payload.user_id);
            return SucessResponse(result);
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }
    async EditProfile(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            const payload = await VerifyToken(token);
            if (!payload) return ErrorResponse(403, "authorization failed");

            const input = plainToClass(ProfileInput, event.body);
            const error = await AppValidationError(input);
            if (error) return ErrorResponse(404, error);

            await this.repository.editProfile(payload.user_id, input);
            return SucessResponse({ message: "Profile Updated!" });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    // Cart Section
    async CreateCart(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Create Cart" });
    }

    async GetCart(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Get Cart" });
    }

    async UpdateCart(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Update Cart" });
    }

    // Payment Section
    async CreatePaymentMethod(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Create Payment Method" });
    }

    async GetPaymentMethod(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Get Payment Method" });
    }

    async UpdatePaymentMethod(event: APIGatewayProxyEventV2) {
        return SucessResponse({ message: "response from Update Payment Method" });
    }
}