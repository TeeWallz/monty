import { getChumpData } from "@utils/getChumps";

export async function GET() {
  const { chumps } = await getChumpData();
  const output = chumps.map(({ slug, data }) => ({
    slug,
    name: data.name,
    date: data.date.toISOString().split("T")[0],
    thanks: data.thanks,
    url: data.url,
    image: data.image,
    streak: data.streak,
    localisedDate: data.localisedDate,
    dateBasic: data.dateBasic,
  }));
  return new Response(JSON.stringify(output, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
