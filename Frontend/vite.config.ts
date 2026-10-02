// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "my-donations-api-handler",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || "";
            if (
              req.method === "GET" &&
              (url.startsWith("/api/donations/myDonations") ||
                url.startsWith("/api/donations/mydonations") ||
                url.startsWith("/api/myDonations"))
            ) {
              const authHeader = req.headers["authorization"] || "";
              const backendUrl = "http://100.67.216.41:4050";

              try {
                // 1. First, try upstream backend endpoint
                const upstreamRes = await fetch(`${backendUrl}${url}`, {
                  headers: {
                    ...(authHeader ? { Authorization: authHeader } : {}),
                    "Content-Type": "application/json",
                  },
                });

                if (upstreamRes.ok) {
                  const data = await upstreamRes.text();
                  res.writeHead(upstreamRes.status, {
                    "Content-Type": "application/json",
                  });
                  res.end(data);
                  return;
                }

                // 2. If upstream returned error (e.g. older docker container before Jenkins build), resolve user's own items cleanly
                const dashRes = await fetch(`${backendUrl}/api/dashboard/dashboard`, {
                  headers: {
                    ...(authHeader ? { Authorization: authHeader } : {}),
                  },
                });

                if (!dashRes.ok) {
                  res.writeHead(dashRes.status, { "Content-Type": "application/json" });
                  res.end(await dashRes.text());
                  return;
                }

                const dashData = await dashRes.json();
                const payload = dashData?.responseData || dashData;
                let userDonations: any[] = [];

                if (Array.isArray(payload?.donations) && payload.donations.length > 0) {
                  userDonations = payload.donations;
                } else if (Array.isArray(payload?.products) && payload.products.length > 0) {
                  userDonations = payload.products;
                } else if (Array.isArray(payload?.activities)) {
                  const donationActs = payload.activities.filter(
                    (a: any) =>
                      (a.activity === "PRODUCT_ADDED" || (a.activity || "").includes("DONAT")) &&
                      (a.product || a.productId)
                  );

                  const items = await Promise.all(
                    donationActs.map(async (act: any) => {
                      const id = act.product?.UUID || act.product?._id || act.productId;
                      if (!id) return null;
                      try {
                        const pRes = await fetch(`${backendUrl}/api/products/${id}`, {
                          headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
                        });
                        if (pRes.ok) {
                          const pData = await pRes.json();
                          return pData?.responseData?.product || pData?.responseData || null;
                        }
                      } catch {}
                      return null;
                    })
                  );

                  const valid = items.filter(Boolean);
                  userDonations = Array.from(
                    new Map(valid.map((item: any) => [item.UUID || item._id, item])).values()
                  );
                }

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    responseCode: 200,
                    responseMessage: "My donations loaded successfully",
                    responseData: {
                      donations: userDonations,
                      totalDonations: userDonations.length,
                    },
                  })
                );
                return;
              } catch (err: any) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ responseCode: 500, responseMessage: err.message }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    server: {
      proxy: {
        "/api": {
          target: "http://100.67.216.41:4050",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

