import type { ActionFunctionArgs } from "react-router";
import { getShopify, type Env } from "../shopify.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
    const { authenticate, sessionStorage } = getShopify(
      (context as { env: Env }).env,
    );
    const { payload, session, topic, shop } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const current = payload.current as string[];
    if (session) {
        session.scope = current.toString();
        await sessionStorage.storeSession(session);
    }
    return new Response();
};
