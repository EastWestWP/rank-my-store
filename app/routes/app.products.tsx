import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useFetcher, useLoaderData } from "react-router";
import { getShopify, type Env } from "../shopify.server";
import { getDb } from "../db.server";

type ProductRow = {
  id: string;
  shopify_product_id: string;
  title: string;
  status: string;
  cached_at: string | null;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);

  const sql = getDb((context as { env: Env }).env);
  const products = await sql<ProductRow[]>`
    select id, shopify_product_id, title, status, cached_at
    from products
    where shop = ${session.shop}
    order by updated_at desc
    limit 50
  `;

  return { products };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "fetch-products") {
    // Placeholder: fetch from Shopify API and upsert into Postgres.
    return { ok: true };
  }

  if (intent === "update-status") {
    const productId = String(formData.get("productId") || "");
    const status = String(formData.get("status") || "");
    const sql = getDb((context as { env: Env }).env);
    await sql`
      update products
      set status = ${status}, updated_at = now()
      where id = ${productId} and shop = ${session.shop}
    `;
    return { ok: true };
  }

  return { ok: false };
};

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  return (
    <s-page heading="Products">
      <s-section heading="Catalog sync">
        <s-paragraph>
          Pull product data into the app cache and assign quality status for
          generation jobs.
        </s-paragraph>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="fetch-products" />
          <s-button type="submit" variant="primary">
            Fetch products
          </s-button>
        </fetcher.Form>
      </s-section>

      <s-section heading="Recent products">
        <s-stack direction="block" gap="base">
          {products.length === 0 ? (
            <s-paragraph>No products cached yet.</s-paragraph>
          ) : (
            products.map((product) => (
              <s-box
                key={product.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack direction="inline" gap="base" align="center">
                  <s-text>{product.title}</s-text>
                  <s-tag>{product.status}</s-tag>
                  <Form method="post">
                    <input type="hidden" name="intent" value="update-status" />
                    <input type="hidden" name="productId" value={product.id} />
                    <s-select name="status" value={product.status}>
                      <option value="qualified">qualified</option>
                      <option value="good">good</option>
                      <option value="needed_improvement">
                        needed_improvement
                      </option>
                    </s-select>
                    <s-button type="submit" variant="tertiary">
                      Update
                    </s-button>
                  </Form>
                </s-stack>
              </s-box>
            ))
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
