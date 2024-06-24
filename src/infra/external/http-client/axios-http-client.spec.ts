import nock from 'nock';
import { mock } from 'vitest-mock-extended';
import { ExternalApiError } from '../errors/external-api-error';
import { AxiosHttpClient } from './axios-http-client';

describe(AxiosHttpClient.name, () => {
  let sut: AxiosHttpClient;

  beforeAll(() => {
    sut = new AxiosHttpClient(mock());
  });

  describe('get()', () => {
    it('should return a valid response when success', async () => {
      const url = 'http://localhost:3000';
      const response = { message: 'success' };
      nock(url).get('/').reply(200, response);

      const httpResponse = await sut.get(new URL(url));

      expect(httpResponse).toEqual({
        status: 200,
        body: response,
      });
    });

    it('should return the correct error when fails', async () => {
      const url = 'http://localhost:3000';
      nock(url).get('/').reply(400, {
        message: 'error',
      });

      await expect(sut.get(new URL(url))).rejects.toThrow(
        new ExternalApiError(400, { message: 'error' }),
      );
    });
  });
});
