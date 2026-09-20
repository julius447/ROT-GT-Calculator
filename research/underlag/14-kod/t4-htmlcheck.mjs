// Minimal strict HTML checker: tag balance, void elements, attribute quoting/duplicates, ids, label/for, aria refs, allowed nesting for a few cases.
import { readFile } from 'node:fs/promises';
const src = await readFile(process.argv[2], 'utf8');
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr','path','circle']);
const stack = []; const issues = []; const ids = {}; const attrsAll = [];
const tagRe = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;
let m; let line = (i) => src.slice(0, i).split('\n').length;
while ((m = tagRe.exec(src))) {
  const [full, close, open, attrStr, selfClose] = m; const ln = line(m.index);
  if (full.startsWith('<!')) continue;
  if (close) { const c = close.toLowerCase(); const top = stack[stack.length-1];
    if (!top) { issues.push(`L${ln}: stray </${c}>`); continue; }
    if (top.tag !== c) { issues.push(`L${ln}: </${c}> but open is <${top.tag}> (opened L${top.ln})`); const idx = stack.map(s=>s.tag).lastIndexOf(c); if (idx>=0) stack.length = idx; }
    else stack.pop(); continue; }
  const t = open.toLowerCase();
  const attrs = {}; const aRe = /([^\s=>\/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let a;
  while ((a = aRe.exec(attrStr))) { const name = a[1].toLowerCase(); const val = a[3] ?? a[4] ?? a[5] ?? ''; if (name in attrs) issues.push(`L${ln}: duplicate attribute ${name} on <${t}>`); if (a[5] !== undefined && a[2] !== undefined) issues.push(`L${ln}: unquoted attribute ${name} on <${t}>`); attrs[name] = val; }
  attrsAll.push({ t, attrs, ln });
  if (attrs.id) { (ids[attrs.id] ||= []).push(ln); }
  if (VOID.has(t) || selfClose) continue;
  stack.push({ tag: t, ln });
}
if (stack.length) issues.push('unclosed: ' + stack.map(s => `<${s.tag}> L${s.ln}`).join(', '));
for (const [id, lns] of Object.entries(ids)) if (lns.length > 1) issues.push(`duplicate id "${id}" at L${lns.join(',')}`);
// refs (template ids ending in -N are placeholders)
for (const { t, attrs, ln } of attrsAll) for (const k of ['for','aria-labelledby','aria-describedby']) if (attrs[k]) for (const id of attrs[k].split(/\s+/)) if (!ids[id]) issues.push(`L${ln}: ${k}="${id}" has no target`);
// aria-label on generic
for (const { t, attrs, ln } of attrsAll) if (attrs['aria-label'] && ['span','div','p'].includes(t) && !attrs.role) issues.push(`L${ln}: aria-label on <${t}> without role (prohibited on generic, ARIA 1.2)`);
// inputs
for (const { t, attrs, ln } of attrsAll) if (t === 'input' && attrs.type === 'text') { for (const k of ['inputmode','autocomplete','enterkeyhint','id']) if (!(k in attrs)) issues.push(`L${ln}: input missing ${k}`); if (attrs.type === 'number') issues.push(`L${ln}: type=number`); }
console.log(issues.length ? issues.join('\n') : 'OK: no structural issues'); console.log('tags:', attrsAll.length, 'ids:', Object.keys(ids).length);
