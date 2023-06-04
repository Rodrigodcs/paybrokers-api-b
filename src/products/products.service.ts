import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dtos/createProduct.dto';
import { Ctx, RmqContext } from '@nestjs/microservices';


@Injectable()
export class ProductsService {
    
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

    async create(
        createProductDto: CreateProductDto,
        @Ctx() context: RmqContext
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        const alreadyExists = await this.productModel.find({name:createProductDto.name}).exec()
        if(alreadyExists.length) {
            channel.ack(originalMsg)
            throw new HttpException('Product already exists', HttpStatus.CONFLICT)
        }
        
        const newProduct = new this.productModel(createProductDto);
        const product = await newProduct.save();
        channel.ack(originalMsg)

        const productObject = product.toObject({versionKey: false})
        return productObject;
    }

    async findAllByPage(page: number,filter: string) {
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
