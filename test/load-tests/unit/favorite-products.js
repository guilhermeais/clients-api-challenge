import { sleep, check, group } from 'k6';
import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const productIds = JSON.parse(open('./product-ids.json'));

const BASE_URL = 'http://localhost:3000';

function createCustomer() {
  const response = http.post(`${BASE_URL}/customers`, {
    email: `${uuidv4()}@mail.com`,
    name: `Customer ${uuidv4()}`,
  });

  check(
    response,
    {
      'create customer status was 2xx': (r) =>
        r.status >= 200 && r.status <= 299,
    },
    { name: 'Create Customer' },
  );

  return JSON.parse(response.body);
}

function addFavoriteProduct(customerId) {
  const favoriteProductUrl = `${BASE_URL}/customers/${customerId}/favorites`;
  const productId = productIds[Math.floor(Math.random() * productIds.length)];

  const res = http.post(favoriteProductUrl, { productId });
  http.post(favoriteProductUrl, { productId }); // duplicate favorite product to test unique constraint

  check(
    res,
    {
      'favorite product status was diff than 5xx': (r) => r.status < 500,
      'favorite product is instant (<= 200)': (r) => r.timings.duration <= 200,
    },
    { name: 'Add Favorite Product' },
  );

  return res;
}

function getFavoriteProducts(customerId) {
  const favoriteProductUrl = `${BASE_URL}/customers/${customerId}/favorites`;
  const res = http.get(favoriteProductUrl);

  check(
    res,
    {
      'get favorite products status was 2xx': (r) =>
        r.status >= 200 && r.status <= 299,
      'response time is <= 200ms': (r) => r.timings.duration <= 200,
      'product id is unique': (r) => {
        const body = JSON.parse(r.body);
        const bodyIds = body.items.map((p) => p.id);
        const uniqueIds = [...new Set(bodyIds)];

        return uniqueIds.length === bodyIds.length;
      },
    },
    { name: 'Get Favorite Products' },
  );

  return res;
}

export function runFavoriteProductFlow() {
  group('Customer Creation', () => {
    const customer = createCustomer();
    group('Add Favorite Product', () => {
      addFavoriteProduct(customer.id);
    });
    group('Get Favorite Products', () => {
      getFavoriteProducts(customer.id);
    });
  });

  sleep(1);
}
