import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("analytics");
  const { blobs } = await store.list();
  const visits = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" })));

  const pageviews = visits.filter(v => !v.type);
  const clicks = visits.filter(v => v.type === "click");

  const dayCounts = {};
  visits.forEach(v => {
    const day = v.time.split("T")[0];
    dayCounts[day] = dayCounts[day] || { views: 0, clicks: 0 };
    v.type === "click" ? dayCounts[day].clicks++ : dayCounts[day].views++;
  });
  const days = Object.keys(dayCounts).sort();

  const pageCounts = {};
  pageviews.forEach(p => pageCounts[p.page] = (pageCounts[p.page] || 0) + 1);
  const clickCounts = {};
  clicks.forEach(c => clickCounts[c.button] = (clickCounts[c.button] || 0) + 1);

  const html = `
  <html><head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
    <style>
      body { font-family: sans-serif; max-width: 700px; margin: 40px auto; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      td, th { padding: 6px 10px; border-bottom: 1px solid #ddd; text-align: left; }
      h1 { font-size: 20px; }
    </style>
  </head><body>
    <h1>Timeline</h1>
    <canvas id="chart" height="100"></canvas>
    <h1>${pageviews.length} Page Views</h1>
    <table>${Object.entries(pageCounts).map(([p,c]) => `<tr><td>${p}</td><td>${c}</td></tr>`).join('')}</table>
    <h1>${clicks.length} Clicks</h1>
    <table>${Object.entries(clickCounts).map(([b,c]) => `<tr><td>${b}</td><td>${c}</td></tr>`).join('')}</table>
    <script>
      new Chart(document.getElementById('chart'), {
        type: 'line',
        data: {
          labels: ${JSON.stringify(days)},
          datasets: [
            { label: 'Views', data: ${JSON.stringify(days.map(d => dayCounts[d].views))}, borderColor: 'blue' },
            { label: 'Clicks', data: ${JSON.stringify(days.map(d => dayCounts[d].clicks))}, borderColor: 'orange' }
          ]
        }
      });
    </script>
  </body></html>`;

  return new Response(html, { headers: { "content-type": "text/html" } });
};

export const config = { path: "/api/report" };