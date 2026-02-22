import { neon } from "@neondatabase/serverless";

export type DbEnv = {
  DATABASE_URL: string;
};

export const getDb = (env: DbEnv) => {
  return neon(env.DATABASE_URL);
};
