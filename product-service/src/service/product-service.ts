import { APIGatewayEvent } from 'aws-lambda';
import { ProductRepository } from '../repository/product-repository';
import { ErrorResponse, SucessResponse } from '../utility/response';
import { plainToClass } from 'class-transformer';
import { AppValidationError } from '../utility/errors';
import { ProductInput } from '../dto/product-input';
import { CategoryRepository } from '../repository/category-repository';

export class ProductService {
    _repository: ProductRepository;
    constructor(
        repository: ProductRepository
    ) {
        this._repository = repository;
    }

    async ResponseWithError(event: APIGatewayEvent) {
        return ErrorResponse(404, new Error("method not allowed!"));
    }

    async createProduct(event: APIGatewayEvent) {
        const input = plainToClass(ProductInput, JSON.parse(event.body!));
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);

        const data = await this._repository.createProduct(input);

        await new CategoryRepository().addItem({
            id: input.category_id,
            products: [data._id]
        });
        return SucessResponse(data);
    }

    async getProducts(event: APIGatewayEvent) {
        const data = await this._repository.getAllProducts();
        return SucessResponse(data);
    }

    async getProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if(!productId) return ErrorResponse(403, "please provide product id!");

        const data = await this._repository.getProductById(productId);
        return SucessResponse(data);
    }

    async editProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if(!productId) return ErrorResponse(403, "please provide product id!");

        const input = plainToClass(ProductInput, JSON.parse(event.body!));
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);
        input.id = productId;
        const data = await this._repository.updateProduct(input);
        return SucessResponse(data);
    }

    async deleteProduct(event: APIGatewayEvent) {
        const productId = event.pathParameters?.id;
        if(!productId) return ErrorResponse(403, "please provide product id!");

        const { category_id, result } = await this._repository.deleteProduct(productId);
        await new CategoryRepository().addItem({
            id: category_id,
            products: [productId]
        });
        return SucessResponse(result);
    }
}