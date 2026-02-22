/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],

  server: "./server.ts",
  serverBuildPath: "functions/[[path]].js",

  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  serverDependenciesToBundle: "all",
  serverConditions: ["workerd", "worker", "browser"],
};