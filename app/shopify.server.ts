import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { KVSessionStorage } from "@shopify/shopify-app-session-storage-kv";

export type Env = {
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_SCOPES?: string;
  SHOPIFY_APP_URL: string;
  SHOP_CUSTOM_DOMAIN?: string;
  SCOPES?: string;
  SESSIONS_KV: KVNamespace;
  DATABASE_URL: string;
  PERPLEXITY_API_KEY?: string;
};

const sessionStorage = new KVSessionStorage();
let shopify: ReturnType<typeof shopifyApp> | undefined;

const getShopify = (env: Env) => {
  sessionStorage.setNamespace(env.SESSIONS_KV);
  if (!shopify) {
    shopify = shopifyApp({
      apiKey: env.SHOPIFY_API_KEY,
      apiSecretKey: env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.October25,
      scopes: (env.SHOPIFY_SCOPES || env.SCOPES)?.split(","),
      appUrl: env.SHOPIFY_APP_URL || "",
      authPathPrefix: "/auth",
      sessionStorage,
      distribution: AppDistribution.AppStore,
      future: {
        expiringOfflineAccessTokens: true,
      },
      ...(env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    });
  }

  return shopify;
};

export { getShopify, sessionStorage };
export const apiVersion = ApiVersion.October25;
