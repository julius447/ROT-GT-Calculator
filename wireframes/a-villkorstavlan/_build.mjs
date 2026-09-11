// Skriver index.html (server-renderat förvalsläge) ur samma renderare som JS:en hydrerar med.
// Kör: node wireframes/a-villkorstavlan/_build.mjs
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { renderPage } from './app.js';

const here = dirname(fileURLToPath(import.meta.url));
const html = renderPage();
await writeFile(join(here, 'index.html'), html, 'utf8');
console.log(`index.html: ${html.length} tecken`);
