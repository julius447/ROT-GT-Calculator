// Bygger den statiska index.html (server-renderat förvalsläge: ROT, fristående) ur samma renderare som webbläsaren kör.
import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderPage } from './app.js';
const here = dirname(fileURLToPath(import.meta.url));
const html = renderPage({ mode: 'rot', surface: 'standalone' });
await writeFile(resolve(here, 'index.html'), html, 'utf8');
console.log(`index.html: ${html.length} tecken`);
