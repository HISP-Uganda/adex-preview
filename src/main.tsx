import {
    RouterProvider,
    createHashHistory,
    createRouter,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";

import "./index.css";

// Import the generated route tree
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } },
});
const history = createHashHistory();
// Set up a Router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    history,
});
// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ConfigProvider
            theme={{
                token: { borderRadius: 0, boxShadow: "none" },
                components: {
                    Table: {
                        borderRadius: 0,
                        cellPaddingBlock: 8,
                    },
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ConfigProvider>
    </StrictMode>,
);
