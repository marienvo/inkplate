import { S3Client } from '@aws-sdk/client-s3';

import {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_BUCKET_NAME,
  R2_SECRET_ACCESS_KEY,
} from '../config.js';

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

function getRequiredString(value: unknown, keyName: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${keyName} is missing in config.js`);
  }

  return value;
}

export function getR2Config(source?: {
  accountId?: unknown;
  accessKeyId?: unknown;
  secretAccessKey?: unknown;
  bucketName?: unknown;
}): R2Config {
  const values = source ?? {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
  };

  return {
    accountId: getRequiredString(values.accountId, 'R2_ACCOUNT_ID'),
    accessKeyId: getRequiredString(values.accessKeyId, 'R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredString(values.secretAccessKey, 'R2_SECRET_ACCESS_KEY'),
    bucketName: getRequiredString(values.bucketName, 'R2_BUCKET_NAME'),
  };
}

export function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}
