import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("analytics");
  const body = await req.json();
  await store.setJSON(`visit-${Date.now()}`, {
    type: body.type || null,
    page: body.page || null,
    button: body.button || null,
    ref: body.ref || null,
    time: new Date().toISOString()
  });
  return new Response("ok");
};

export const config = { path: "/api/track" };