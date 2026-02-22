import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { getShopify, type Env } from "../shopify.server";
import { getDb } from "../db.server";

type TemplateRow = {
  id: string;
  name: string;
  is_default: boolean;
  blocks: string;
};

const defaultBlocks = [
  { id: "hero", label: "Hero text", enabled: true },
  { id: "short_description", label: "Short description", enabled: true },
  { id: "features", label: "Features", enabled: true },
  { id: "long_description", label: "Long description", enabled: true },
  { id: "technical_specs", label: "Technical specification", enabled: true },
  { id: "brand_link", label: "Brand link", enabled: true },
  { id: "youtube_video", label: "YouTube video", enabled: true },
];

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);
  const sql = getDb((context as { env: Env }).env);
  const templates = await sql<TemplateRow[]>`
    select id, name, is_default, blocks::text
    from templates
    where shop = ${session.shop}
    order by updated_at desc
  `;

  return { templates };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const sql = getDb((context as { env: Env }).env);

  if (intent === "create-default") {
    await sql`
      insert into templates (shop, name, is_default, blocks)
      values (
        ${session.shop},
        ${"Standard template"},
        true,
        ${JSON.stringify(defaultBlocks)}
      )
    `;
    return { ok: true };
  }

  return { ok: false };
};

export default function TemplatesPage() {
  const { templates } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Templates">
      <s-section heading="Standard structure">
        <s-paragraph>
          Define the block order for generated descriptions. Drag-and-drop UI
          will be added next.
        </s-paragraph>
        <Form method="post">
          <input type="hidden" name="intent" value="create-default" />
          <s-button type="submit" variant="primary">
            Create standard template
          </s-button>
        </Form>
      </s-section>

      <s-section heading="Templates list">
        <s-stack direction="block" gap="base">
          {templates.length === 0 ? (
            <s-paragraph>No templates yet.</s-paragraph>
          ) : (
            templates.map((template) => (
              <s-box
                key={template.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack direction="inline" gap="base" align="center">
                  <s-text>{template.name}</s-text>
                  {template.is_default && <s-tag>default</s-tag>}
                </s-stack>
              </s-box>
            ))
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
