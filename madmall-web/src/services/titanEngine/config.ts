import 'dotenv/config';

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '8080', 10),
  DATA_DIR: process.env.DATA_DIR || './data',
  BASE_URL: process.env.BASE_URL || 'http://localhost:8080',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
  SD_WEBUI_URL: process.env.SD_WEBUI_URL || '',
};
