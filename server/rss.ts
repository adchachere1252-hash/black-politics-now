import type { Express } from "express";
import { getEpisodesFormatted } from "./podcastDb";

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function registerRssRoute(app: Express) {
  app.get("/api/rss", async (_req, res) => {
    try {
      const episodes = await getEpisodesFormatted() as any[];
      const channelTitle = "Black Politics Now - Daily Intelligence Brief";
      const channelLink = "https://blkpoliticsnow.com";
      const channelDesc = "12 topics. 12 minutes. Everything you need. A daily podcast covering politics, policy, and power from the Black perspective.";

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(channelTitle)}</title>
  <link>${channelLink}</link>
  <description>${escapeXml(channelDesc)}</description>
  <language>en-us</language>
  <itunes:author>Black Politics Now</itunes:author>
  <itunes:category text="News">
    <itunes:category text="Politics"/>
  </itunes:category>
  <itunes:explicit>false</itunes:explicit>
`;

      for (const ep of episodes.slice(0, 50)) {
        const title = `Daily Intelligence Brief - ${ep.day || ep.date}`;
        const pubDate = new Date(ep.date + "T08:00:00Z").toUTCString();
        const audioUrl = ep.fullEpisodeCdnUrl || "";
        const totalSec = ep.segments.reduce((sum: number, s: any) => sum + (s.durationSec || 60), 0);
        const description = ep.segments.map((s: any) => `${s.emoji} ${s.label}`).join(", ");

        xml += `  <item>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <pubDate>${pubDate}</pubDate>
    <guid isPermaLink="false">bpn-dib-${ep.date}</guid>
    ${audioUrl ? `<enclosure url="${escapeXml(audioUrl)}" type="audio/mpeg" length="0"/>` : ""}
    <itunes:duration>${formatDuration(totalSec)}</itunes:duration>
    <itunes:episode>${episodes.indexOf(ep) + 1}</itunes:episode>
  </item>
`;
      }

      xml += `</channel>\n</rss>`;
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      console.error("[RSS] Error generating feed:", err);
      res.status(500).send("Error generating RSS feed");
    }
  });
}
