import { createFileRoute } from "@tanstack/react-router";

const UPSTREAM = "https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api";

// Passes through the upstream status and body unchanged.
// Used as a CORS-safe fallback when the browser refuses the direct call.
export const Route = createFileRoute("/api/public/tkgm/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const rest = (params as { _splat?: string })._splat ?? "";
        const url = `${UPSTREAM}/${rest}`;
        try {
          const upstream = await fetch(url, {
            headers: { accept: "application/json,application/geo+json,*/*" },
          });
          const body = await upstream.arrayBuffer();
          return new Response(body, {
            status: upstream.status,
            headers: {
              "content-type":
                upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
              "access-control-allow-origin": "*",
              "x-tkgm-upstream-url": url,
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              proxyError: true,
              url,
              message: err instanceof Error ? err.message : String(err),
            }),
            {
              status: 502,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "access-control-allow-origin": "*",
              },
            },
          );
        }
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,OPTIONS",
            "access-control-allow-headers": "*",
          },
        }),
    },
  },
});
