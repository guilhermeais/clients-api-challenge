import { sleep, check } from 'k6';
import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

/**
 * @type {string[]}
 */
const productIds = JSON.parse(open('./product-ids.json'));

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m30s', target: 15 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const response = http.post(`${BASE_URL}/customers`, {
    email: `${uuidv4()}@mail.com`,
    name: `Customer ${uuidv4()}`,
  });

  console.log(response.body);

  /**
   * @type {{id: string; name: string; email: string}}
   */
  const defaultCustomer = JSON.parse(response.body);

  const favoriteProductUrl = `${BASE_URL}/customer/${defaultCustomer.id}/favorites`;

  const productId = productIds[Math.floor(Math.random() * productIds.length)];

  const res = http.post(favoriteProductUrl, {
    productId,
  });

  const getFavoriteProductsRes = http.get(favoriteProductUrl);

  check(res, {
    'favorite product status was >= 200 and <= 299': (r) =>
      r.status >= 200 && r.status <= 299,
  });

  check(getFavoriteProductsRes, {
    'get favorite products status was >= 200 and <= 299': (r) =>
      r.status >= 200 && r.status <= 299,
    'get favorite products response time is less than 200ms': (r) =>
      r.timings.duration < 200,
  });
  sleep(1);
}
