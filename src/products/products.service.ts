import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dtos/createProduct.dto';


@Injectable()
export class ProductsService {

    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async create(createProductDto: CreateProductDto) {
        console.log(createProductDto)
        const alreadyExists = await this.productModel.find({name:createProductDto.name}).exec()
        console.log("teste",alreadyExists)
        if(alreadyExists.length) {
            throw new HttpException('Product already exists', HttpStatus.CONFLICT)
        }
        const newProduct = new this.productModel(createProductDto);
        const savedProduct = await newProduct.save();

        console.log(savedProduct)
        return "New product added";
    }

    async findAll(page: number,name: string) {
        let query: any = {}
        if(name) {
            query.name = {$regex: new RegExp(name)}
        }

        const perPage = 10;
        const skip = (page - 1) * perPage;

        const testt = await this.productModel
        .find(query)
        .select('-__v')
        .skip(skip)
        .limit(perPage)
        .exec();

        console.log(testt)
        return testt
    }
}
