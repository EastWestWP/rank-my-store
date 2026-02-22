
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { getShopify, type Env } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  await authenticate.admin(request);

  return null;
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
