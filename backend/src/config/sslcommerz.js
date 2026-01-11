import SSLCommerzPayment from 'sslcommerz-lts';

const store_id = process.env.SSLCZ_STORE_ID;
const store_passwd = process.env.SSLCZ_STORE_PASS;
const is_live = process.env.SSLCZ_IS_LIVE === 'true'; 

export function getSslcz() {
  return new SSLCommerzPayment(store_id, store_passwd, is_live);
}