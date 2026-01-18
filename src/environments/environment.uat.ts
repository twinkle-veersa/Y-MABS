import { CONFIG } from '@constants/configs';

export const environment = {
  production: false,
  ...CONFIG,
  secretKey: 'U?_4S)w@*F!AxZ+',
  portalUrl: `https://ext-api.pharmacord.com/portaluat/api/v1.0/`,
  portalv11Url: `https://ext-api.pharmacord.com/portaluat/api/v1.1/`,
  gateqayUrl: `https://ext-api.pharmacord.com/gatewayuat/api/v1.0/`
};
