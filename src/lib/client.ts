import axios, { AxiosInstance } from 'axios';

import { createError } from './errors';
import { EVERY_NODE_VERSION } from './version';

export enum EverifyApiError {
  'InvalidBodyError' = 'InvalidBodyError',
  'NoProjectFoundError' = 'NoProjectFoundError',
  'InternalVerificationStartError' = 'InternalVerificationStartError',
  'NoCurrentlyActiveVerificationError' = 'NoCurrentlyActiveVerificationError',
}

export interface EverifyConstructorArgs {
  sandbox?: boolean;
  baseUrl?: string;
}

export interface EverifyStartVerificationArgs {
  phoneNumber: string;
  method?: 'SMS';
  locale?: string;
  sandbox?: boolean;
}

export interface EverifyCheckVerificationArgs {
  phoneNumber: string;
  code: string;
}

export type EverifyStartVerificationResponse = {
  locale: string;
  phoneNumber: string;
  sandbox?: boolean;
  id: string;
  createdAt: string;
  expiresAt: string;
  status: 'PENDING';
};

export type EverifyCheckVerificationResponse = {
  status: 'PENDING' | 'SUCCESS';
};

const getAxiosInstance = ({
  baseUrl,
  apiKey,
}: {
  baseUrl: string;
  apiKey: string;
}) => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 5000,
    headers: {
      'X-Everify-Client': `everify-node@${EVERY_NODE_VERSION}`,
      Authorization: `Bearer ${apiKey}`,
    },
  });
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      const contentType = err.response?.headers?.['content-type'];
      if (!contentType && !contentType.includes('application/json')) {
        throw new Error(
          `Invalid Server response. Status ${err.response.status}. Data: ${err.response.data}`
        );
      }
      throw createError(err.response.data);
    }
  );
  return instance;
};

export class Everify {
  private sandboxEnabled: boolean;
  private axiosClient: AxiosInstance;

  constructor(
    apiKey: string,
    {
      sandbox = false,
      baseUrl = 'https://everify.dev/api',
    }: EverifyConstructorArgs | undefined = {}
  ) {
    this.sandboxEnabled = sandbox;
    this.axiosClient = getAxiosInstance({ baseUrl, apiKey });
  }

  public sandbox(on: boolean | undefined = true) {
    this.sandboxEnabled = on;
  }

  public async startVerification({
    phoneNumber,
    method = 'SMS',
    locale,
    sandbox: forceSandbox,
  }: EverifyStartVerificationArgs) {
    const body = {
      phoneNumber,
      method,
      locale,
      sandbox: forceSandbox ?? this.sandboxEnabled,
    };

    const response = await this.axiosClient.post<EverifyStartVerificationResponse>(
      'verifications/start',
      body
    );
    return response.data;
  }

  public async checkVerification({
    phoneNumber,
    code,
  }: EverifyCheckVerificationArgs) {
    const body = {
      phoneNumber,
      code,
    };

    const response = await this.axiosClient.post<EverifyCheckVerificationResponse>(
      'verifications/check',
      body
    );
    return response.data;
  }
}
