// Skriver det server-renderade förvalsläget (rot, standalone, inga svar rörda) till index.html.
// Körs: node wireframes/c-avdragsmataren/_build.mjs   (från repo-roten)
import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderPage } from './app.js';
import { defaultState } from '../../logik/ui-model.js';

const here = dirname(fileURLToPath(import.meta.url));
const html = renderPage('rot', defaultState('rot'), new Set(), 'standalone');
if (/[–—·]/.test(html)) throw new Error('tankstreck eller mittpunkt i utdatan');
await writeFile(resolve(here, 'index.html'), html, 'utf8');
console.log(`index.html skriven, ${html.length} tecken`);
