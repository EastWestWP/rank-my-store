import { hydrateRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";

hydrateRoot(document, <RouterProvider router={router} />);