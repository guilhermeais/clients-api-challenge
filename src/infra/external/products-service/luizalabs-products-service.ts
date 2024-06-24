import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ProductsServiceGateway } from '@/domain/application/gateways/external/products-service.interface';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Product } from '@/domain/enterprise/entities/product';
import { EnvService } from '@/infra/env/env.service';
import { HttpClient } from '../http-client.interface';
import { ExternalApiError } from '../errors/external-api-error';

export type LuizaLabsProduct = {
  price: number;
  image: string;
  brand: string;
  id: string;
  title: string;
};

export class LuizaLabsProductsService implements ProductsServiceGateway {
  constructor(
    private readonly logger: Logger,
    private readonly env: EnvService,
    private readonly httpClient: HttpClient,
  ) {}

  async findById(id: string): Promise<Product> {
    try {
      const baseUrl = this.env.get('PRODUCTS_SERVICE_URL');
      const url = new URL(`${baseUrl}/product/${id}`);

      this.logger.log(
        LuizaLabsProductsService.name,
        `Requesting product from ${url.toString()}`,
      );

      const { body: product } =
        await this.httpClient.get<LuizaLabsProduct>(url);

      this.logger.log(
        LuizaLabsProductsService.name,
        `Found the product ${product.title} with id ${id}`,
      );

      return Product.restore(
        {
          image: product.image,
          price: product.price,
          title: product.title,
        },
        new UniqueEntityID(product.id),
      );
    } catch (error) {
      this.logger.error(
        LuizaLabsProductsService.name,
        `Error while trying to find product with id ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof ExternalApiError) {
        if (error.statusCode === 404) {
          return null;
        }
      }

      throw error;
    }
  }
}
