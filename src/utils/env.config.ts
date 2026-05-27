import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  testUser: {
    username: process.env.TEST_USERNAME || 'Admin',
    password: process.env.TEST_PASSWORD || 'admin123',
  },
  timeout: {
    action: 15000,
    navigation: 30000,
  }
};
