import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/createProduct.dto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Product } from './schemas/product.schema';


@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) {}

    @EventPattern('newProduct')
    async create(
        @Payload() createProductDto: CreateProductDto,
        @Ctx() context: RmqContext 
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        
        channel.ack(originalMsg)
        return this.productsService.create(createProductDto);
    }

    @Get(':page')
    async findAll(
        @Param('page') page:number,
        @Query('filter') filter: string,
    ): Promise<Product[]> {
        return this.productsService.findAll(page,filter)
    } 
}