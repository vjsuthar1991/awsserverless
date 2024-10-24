import { ProductInput } from "../dto/product-input";
import { ProductDoc, products } from "../models";


export class ProductRepository {
    constructor() { }

    async createProduct({
        name,
        description,
        price,
        category_id,
        image_url,
        seller_id
    }: ProductInput) {
        return products.create({
            name,
            description,
            price,
            category_id,
            image_url,
            availability: true,
            seller_id
        });
    }

    async getAllProducts(offset = 0, pages?: number) {
        return products.find().skip(offset).limit(pages ? pages : 100);
    }

    async getAllSellerProducts(seller_id: number) {
        return products.find({ seller_id: seller_id });
    }

    async getProductById(id: string) {
        return (await products.findById(id)) as ProductDoc;
    }

    async updateProduct({
        id,
        name,
        description,
        price,
        category_id,
        image_url,
        availability,
    }: ProductInput) {
        let existingProduct = await products.findById(id) as ProductDoc;
        existingProduct.name = name;
        existingProduct.description = description;
        existingProduct.price = price;
        existingProduct.category_id = category_id;
        existingProduct.image_url = image_url;
        existingProduct.availability = availability;
        return existingProduct.save();
    }

    async deleteProduct(id: string): Promise<{ category_id: string, result: any, deletedCount?: number }> {
        const { category_id } = (await products.findById(id)) as ProductDoc;
        const result = await products.deleteOne({ _id: id }).exec();
        return { category_id, result, deletedCount: result.deletedCount };
    }
}
