import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { buildSheetsTsv, defaultPeriod, orgBySheetsToken, type SheetsKind } from "@/lib/server/sheets-feed";

function parseKind(raw: string | null): SheetsKind {
  return raw === "period" ? "period" : "today";
}

function dateOr(raw: string | null, fallback: string): string {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

async function handleGet(request: Request, token: string): Promise<Response> {
  const url = new URL(request.url);
  const kind = parseKind(url.searchParams.get("kind"));
  const range = defaultPeriod();
  const from = dateOr(url.searchParams.get("from"), range.from);
  const to = dateOr(url.searchParams.get("to"), range.to);
  const sql = await getSql();
  const org = await orgBySheetsToken(sql, token);
  if (!org) {
    return new Response("Недійсне посилання", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const file = await buildSheetsTsv(sql, org, kind, from, to);
  return new Response(`\uFEFF${file.body}`, {
    status: 200,
    headers: {
      "content-type": "text/tab-separated-values; charset=utf-8",
      "content-disposition": `inline; filename="${file.filename}"`,
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=120",
    },
  });
}

export const Route = createFileRoute("/api/sheets/$token")({
  server: {
    handlers: {
      GET: ({ request, params }) => handleGet(request, params.token),
      OPTIONS: () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
          },
        }),
    },
  },
});
