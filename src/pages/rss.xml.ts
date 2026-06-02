import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE } from "@lib/site";

export async function GET(context: APIContext) {
  const articoli = (await getCollection("diario", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.data.getTime() - a.data.data.getTime(),
  );

  return rss({
    title: "Diario — Tao Veda",
    description:
      "Articoli sempreverdi sul mondo olistico che alimenta Tao Veda: Tao, Veda, kundalini, archetipi e pratica del corpo.",
    site: context.site ?? SITE.url,
    items: articoli.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.data,
      link: `/conoscenza/diario/${a.slug}`,
      categories: a.data.tags,
    })),
    customData: `<language>it-it</language>`,
  });
}
