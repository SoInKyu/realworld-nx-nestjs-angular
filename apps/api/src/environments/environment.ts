import { IApiConfig } from '@realworld/shared/api/config';
require('dotenv').config();
const packageJson = require('../../../../package.json');

export const environment: IApiConfig = {
  production: false,
  applicationName: 'Sen Viet API',
  host: 'http://localhost',
  port: 3333,
  version: packageJson.version,
  debug: true,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: '1y',
};
