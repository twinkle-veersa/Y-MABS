import { CONFIG } from '@constants/configs';

export const environment = {
  production: false,
  ...CONFIG,
  portalUrl: `https://ext-api.pharmacord.com/portalqa/api/v1.0/`,
  portalv11Url: `https://ext-api.pharmacord.com/portalqa/api/v1.1/`,
  gateqayUrl: `https://ext-api.pharmacord.com/gatewayqa/api/v1.0/`
};
