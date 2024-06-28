import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Logger } from '@/domain/application/gateways/tools/logger.interface';
import { Product } from '@/domain/enterprise/entities/product';
import { EnvService } from '@/infra/env/env.service';
import { faker } from '@faker-js/faker';
import { MockProxy, mock } from 'vitest-mock-extended';
import { ExternalApiError } from '../errors/external-api-error';
import { HttpClient } from '../http-client.interface';
import {
  LuizaLabsProduct,
  LuizaLabsProductsService,
} from './luizalabs-products-service';
import { InMemoryCacheAdapter } from '@/infra/cache/in-memory-cache/in-memory-cache.adapter';

function makeLuizaLabsProduct(
  modifications?: Partial<LuizaLabsProduct>,
): LuizaLabsProduct {
  return {
    brand: faker.company.name(),
    id: faker.string.uuid(),
    image: faker.image.url(),
    price: Number(faker.finance.amount()),
    title: faker.commerce.productName(),
    ...modifications,
  };
}

describe(`${LuizaLabsProductsService.name}`, () => {
  let sut: LuizaLabsProductsService;
  let logger: MockProxy<Logger>;
  let httpClient: MockProxy<HttpClient>;
  let env: MockProxy<EnvService>;
  let cache: InMemoryCacheAdapter;

  const baseUrl = 'http://localhost:3000';
  let defaultLuizaLabsProduct: LuizaLabsProduct;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    defaultLuizaLabsProduct = makeLuizaLabsProduct();

    logger = mock();
    httpClient = mock();
    env = mock();

    httpClient.get.mockResolvedValue({
      body: defaultLuizaLabsProduct,
      status: 200,
    });
    env.get.mockReturnValue(baseUrl);
    cache = new InMemoryCacheAdapter();

    sut = new LuizaLabsProductsService(logger, env, httpClient, cache);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('findById()', () => {
    it('should return a valid product', async () => {
      const product = await sut.findById(defaultLuizaLabsProduct.id);

      expect(product).toEqual(
        Product.restore(
          {
            image: defaultLuizaLabsProduct.image,
            price: defaultLuizaLabsProduct.price,
            title: defaultLuizaLabsProduct.title,
          },
          new UniqueEntityID(defaultLuizaLabsProduct.id),
        ),
      );

      expect(httpClient.get).toHaveBeenCalledWith(
        new URL(`${baseUrl}/product/${defaultLuizaLabsProduct.id}/`),
      );
    });

    it('should return null if an external api error is thrown from the http client', async () => {
      httpClient.get.mockRejectedValue(
        new ExternalApiError(404, 'Product not found'),
      );

      const product = await sut.findById(defaultLuizaLabsProduct.id);

      expect(product).toBeNull();
    });

    it('should throw an error if an unexpected error is thrown from the http client', async () => {
      httpClient.get.mockRejectedValue(
        new ExternalApiError(500, 'Unexpected error'),
      );

      await expect(sut.findById(defaultLuizaLabsProduct.id)).rejects.toThrow(
        new ExternalApiError(500, 'Unexpected error'),
      );
    });

    it('should use the cached product if it exists on cache', async () => {
      const product = await sut.findById(defaultLuizaLabsProduct.id);

      expect(product).toEqual(
        Product.restore(
          {
            image: defaultLuizaLabsProduct.image,
            price: defaultLuizaLabsProduct.price,
            title: defaultLuizaLabsProduct.title,
          },
          new UniqueEntityID(defaultLuizaLabsProduct.id),
        ),
      );
      await sut.findById(defaultLuizaLabsProduct.id);
      await sut.findById(defaultLuizaLabsProduct.id);
      await sut.findById(defaultLuizaLabsProduct.id);

      expect(httpClient.get).toHaveBeenCalledTimes(1);
    });
  });
});
