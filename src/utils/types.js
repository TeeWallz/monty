"use strict";
exports.__esModule = true;
exports.ChumpZodSchema = void 0;
var astro_content_1 = require("astro:content");
exports.ChumpZodSchema = astro_content_1.z.object({
    id: astro_content_1.z.string(),
    name: astro_content_1.z.string(),
    slug: astro_content_1.z.string(),
    thanks: astro_content_1.z.string().nullable(),
    url: astro_content_1.z.string(),
    date: astro_content_1.z.date(),
    dateBasic: astro_content_1.z.string(),
    date_chump: astro_content_1.z.number(),
    streak: astro_content_1.z.number(),
    localisedDate: astro_content_1.z.string(),
    image: astro_content_1.z.string(),
    streak_max_proportion: astro_content_1.z.number()
});
