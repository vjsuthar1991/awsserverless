import mongoose from "mongoose";

type CategoryModel = {
    name: string;
    nameTranslations: string;
    parentId: string;
    subCategories: CategoryDoc[];
    products: string[];
    displayOrder: number;
    imageUrl: string;
}

export type CategoryDoc = mongoose.Document & CategoryModel;

export const categorySchema = new mongoose.Schema(
    {
        name: String,
        nameTranslations: { en: { type: String }, de: { type: String } },
        parentId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "categories"
        },
        subCategories: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "categories"
            }
        ],
        products: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "products"
            }
        ],
        displayOrder: { type: Number, default: 1 },
        imageUrl: String,
    },
    {
        toJSON: {
            transform(doc, ret, options) {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true,
    }
);

export const categories = mongoose.models.categories || mongoose.model<CategoryDoc>("categories", categorySchema);
