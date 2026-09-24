import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("analytics");
  const { blobs } = await store.list();
  const visits = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" })));
  return new Response(
    `<h1>${visits.length} visits</h1><pre>${JSON.stringify(visits, null, 2)}</pre>`,
    { headers: { "content-type": "text/html" } }
  );
};

export const config = { path: "/api/report" };