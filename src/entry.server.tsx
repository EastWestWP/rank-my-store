import { createPagesFunctionHandler } from "@react-router/cloudflare-pages";
import { router } from "./router";

export const onRequest = createPagesFunctionHandler({
  router,
  getLoadContext: (context) => ({ env: context.env }),
});