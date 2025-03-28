// read .md files from src/content/chumps/*md
// read the yaml frontmatter
// and create a json file with the data
// with the frontmatter looking like
// name: "Montague’s Bridge Blunder: White Digger Aims High, Hits Low"
// name_slug: montague-s-bridge-blunder--white-digger-aims-high--hits-low
// date: 2024-04-18
// thanks: Thank you Daniel!
// url: /
// image: /images/chumps/2024-04-18.png

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Chump } from '../utils/types';
import {getChumpJson} from '../utils/chumpUtils';

const chumpsJson = await getChumpJson();
console.log("chumpsJson", chumpsJson);
fs.writeFileSync(path.join(process.cwd(), 'public/chumps.json'), chumpsJson);