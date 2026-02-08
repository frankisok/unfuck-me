import { TEnvConfig } from "amp-ng-library";

const IMAGE_SERVER = 'https://www.atmosphere365.com';
const IMAGE_DIRECTORY = 'images/Production';

const CLIENT_ID = '50139dc8-0a05-4fbb-a891-da113788e27a';
const CLIENT_SECRET = 'AwF/j/i0UEbta4uKwxNle7eTplMr+7n+TaFch1Y7IE842843sVCu3Z6swbBnDuM5eMcBKEqe9SpcRsytA6q+oaHFSya7NJkoAaEMTKKbCIH8eAwQo6d5MITrFXdySKqjMgs=';

const STRIPE_TEST_API_KEY = 'pk_test_B3xOvVaaIBZAFxuETYut44Tn';

const USE_LOCAL_API = false // change this to true to use desktop as the server, 
const PORT = USE_LOCAL_API ? 9999 : 8080
const LOCAL_ADDRESS = `localhost:${PORT}` // change localhost to ip address if need be
const LOCAL_IMAGE_SERVER = `http://${LOCAL_ADDRESS}`;

const HOST = 'accountdev.atmosphere365.com';
// const HOST = 'localhost:8080';
export const environment = {
  production: false,
  host: 'accountdev.atmosphere365.com',
  server: 'https://' + HOST, // NOTE: http for local host
  wsserver: 'wss://' + HOST, // NOTE: ws not wss. (For localhost only).
  // server: 'http://' + HOST, // NOTE: http for local host
  // wsserver: 'ws://' + HOST, // NOTE: ws not wss. (For localhost only).
  cookieDomain: 'accountdev',

  imageServer: USE_LOCAL_API ? LOCAL_IMAGE_SERVER : IMAGE_SERVER,
  imageDirectory: IMAGE_DIRECTORY,

  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,

  stripeAPIKey: STRIPE_TEST_API_KEY,

  analyticSiteId: 1,

  useLocalApi: USE_LOCAL_API,
  mode: 'online' as TEnvConfig,
  offlineServer: `http://${LOCAL_ADDRESS}/atmosphere`,
  offlineWSServer: `ws://${LOCAL_ADDRESS}/atmosphere`,

};
