import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microService = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'products_queue',
      noAck: false,
      queueOptions: {
        durable: false
      },
    },
  });
  const port = process.env.PORT
  await app.listen(port, () => console.log(`Server running on port ${port}`));
  await microService.listen()
}
bootstrap();