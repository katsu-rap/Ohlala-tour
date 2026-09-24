import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const body = await req.json();
  await store.setJSON(`visit-${Date.now()}`, {
    page: body.page,
    ref: body.ref,
    time: new Date().toISOString()
  });
  return new Response("ok");
};

export const config = { path: "/api/track" };