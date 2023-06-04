import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dtos/createProduct.dto';


@Injectable()
export class ProductsService {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async create(createProductDto: CreateProductDto) {
        const alreadyExists = await this.productModel.find({name:createProductDto.name}).exec()
        if(alreadyExists.length) throw new HttpException('Product already exists', HttpStatus.CONFLICT)

        const newProduct = new this.productModel(createProductDto);
        const product = await newProduct.save();
        const productObject = product.toObject({versionKey: false})

        console.log(productObject)
        return productObject;
    }

    async findAll(page: number,filter: string) {
        let query: any = {}
        if(filter) {
            query.name = {$regex: new RegExp(filter)}
        }

        const perPage = 10;
        const skip = (page - 1) * perPage;

        return this.productModel
        .find(query)
        .select('-__v')
        .skip(skip)
        .limit(perPage)
        .exec();
    }
}
