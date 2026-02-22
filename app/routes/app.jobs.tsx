import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData } from "react-router";
import { getShopify, type Env } from "../shopify.server";
import { getDb } from "../db.server";

type JobRow = {
  id: string;
  type: string;
  status: string;
  created_at: string;
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);
  const sql = getDb((context as { env: Env }).env);
  const jobs = await sql<JobRow[]>`
    select id, type, status, created_at
    from jobs
    where shop = ${session.shop}
    order by created_at desc
    limit 50
  `;

  return { jobs };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { authenticate } = getShopify((context as { env: Env }).env);
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const sql = getDb((context as { env: Env }).env);

  if (intent === "create-job") {
    const type = String(formData.get("type") || "generate");
    await sql`
      insert into jobs (shop, type, status)
      values (${session.shop}, ${type}, 'queued')
    `;
    return { ok: true };
  }

  return { ok: false };
};

export default function JobsPage() {
  const { jobs } = useLoaderData<typeof loader>();

  return (
    <s-page heading="Jobs">
      <s-section heading="Generation queue">
        <s-paragraph>
          Bulk and single-product jobs will appear here for processing.
        </s-paragraph>
        <Form method="post">
          <input type="hidden" name="intent" value="create-job" />
          <s-select name="type" value="generate">
            <option value="generate">Generate descriptions</option>
            <option value="import">Import to Shopify</option>
          </s-select>
          <s-button type="submit" variant="primary">
            Create job
          </s-button>
        </Form>
      </s-section>

      <s-section heading="Recent jobs">
        <s-stack direction="block" gap="base">
          {jobs.length === 0 ? (
            <s-paragraph>No jobs yet.</s-paragraph>
          ) : (
            jobs.map((job) => (
              <s-box
                key={job.id}
                padding="base"
                borderWidth="base"
                borderRadius="base"
              >
                <s-stack direction="inline" gap="base" align="center">
                  <s-text>{job.type}</s-text>
                  <s-tag>{job.status}</s-tag>
                  <s-text tone="subdued">{job.created_at}</s-text>
                </s-stack>
              </s-box>
            ))
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
