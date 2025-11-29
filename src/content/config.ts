import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

// content:
//   - name: chumps
//     label: Chumps
//     type: collection
//     path: src/content/chumps
//     fields:
//       - { name: name, label: Name, widget: "string" }
//       - { name: slug, label: Slug, type: string }
//       - name: date
//         label: Date
//         type: date
//         options:
//           format: yyyy-MM-dd
//       # - { name: date_chump, default: 1, label: "Order of chump on a given day", widget: "number", value_type: "int" }
//       - name: date_chump
//         label: "Order of chump on a given day"
//         type: number
//       - { name: thanks, default: "temp", label: Thanks, widget: "string" }
//       - { name: url, default: "temp", label: URL, widget: "string" }
//       - name: image
//         label: Image
//         type: image
//         list: false
//         options:
//           path: src/content/chumps/images
//           extensions: [ jpg, jpeg, png, gif, webm ]
//   - name: events
//     label: Events
//     type: collection
//     path: src/content/events
//     fields:
//       - { name: title, label: Title, type: string, required: true }
//       - name: date
//         label: Date
//         type: date
//         required: true
//         options:
//           format: yyyy-MM-dd
//       - name: event_type
//         label: Event Type
//         type: select
//         required: true
//         options:
//           values: [ Chump, News, MajorEvent ]
//       - { name: slug, label: Slug, type: string }
//       - { name: thanks, default: "temp", label: Thanks, widget: "string" }
//       - name: body
//         label: Body
//         type: rich-text
//       - name: media
//         label: Media
//         type: object
//         list: true
//         required: false
//         fields:
//           - { name: caption, label: Caption, type: string, required: true }
//           - { name: ismain, label: Is Main Image?, type: boolean, required: true }
//           - name: image
//             label: Image
//             type: image
//             list: false
//             options:
//               path: src/content/chumps/images
//               extensions: [ jpg, jpeg, png, gif, webm ]
//           - name: body
//             label: Body
//             type: rich-text

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
    }),
});

const events = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    event_type: z.enum(["Chump", "News", "MajorEvent"]),
    thanks: z.string().optional(),
    media: z
      .array(
        z.object({
          caption: z.string(),
          ismain: z.boolean(),
          image: z.any(),
          body: z.string(),
        })
      )
      .optional(),
  }),
}); 

export const collections = { blog, events };
