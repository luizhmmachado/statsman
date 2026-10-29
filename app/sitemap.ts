import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://statsman.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/analisar", "/exemplo", "/historico", "/fontes", "/configuracoes"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/analisar" ? 0.9 : 0.5,
  }));
}
