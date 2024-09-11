import { Length } from "class-validator";

export class VerficationInput {
    @Length(6)
    code: string;
}