import { runFavoriteProductFlow } from './favorite-products.js';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m30s', target: 15 },
    { duration: '20s', target: 0 },
  ],
};
export default function () {
  runFavoriteProductFlow();
}
