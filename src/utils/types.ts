import { z, defineCollection, getCollection } from "astro:content";

export const ChumpZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  thanks: z.string().nullable(),
  url: z.string(),
  date: z.date(),
  dateBasic: z.string(),
  date_chump: z.number(),
  streak: z.number(),
  localisedDate: z.string(),
  image: z.string(),
  streak_max_proportion: z.number(),
});

// define type for ChumpData from ChumpZodSchema
export type Chump = z.infer<typeof ChumpZodSchema>;
