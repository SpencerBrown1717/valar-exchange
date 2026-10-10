#!/usr/bin/env node
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { assertEdition, editionDigest, prepareBroadcast, renderEmail, sendEdition, validateEdition, EditorialError } from './editorial.mjs';

const help = `Valar editorial tools (Node 24+)

  draft <file>                         Create a draft scaffold; never sends
  validate <file>                      Check one edition or an archive array
  render <file> <outdir> [--id ID]      Create HTML/plain-text previews
  prepare <file> <outdir> [--id ID]     Write a scoped Resend draft payload; no API call
  publish <file> [--archive FILE]      Add an approved edition to the website archive
  send <file> [--id ID]                Verify public publication and queue once

Use node --env-file=.env.local scripts/newsletter/cli.mjs for configured operations.
No command approves its own content. Sending is disabled unless NEWSLETTER_SEND_ENABLED=true.
`;

export async function publishEdition(edition, archivePath) {
  assertEdition(edition);
  if (!['approved', 'published'].includes(edition.state)) throw new EditorialError('NOT_APPROVED', 'Publication requires explicit editorial approval and verified sources.');
  let archive = [];
  try { archive = JSON.parse(await readFile(archivePath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!Array.isArray(archive)) throw new EditorialError('INVALID_ARCHIVE', 'The website edition archive must be an array.');
  const existing = archive.find((entry) => entry.id === edition.id);
  if (existing && editionDigest(existing) !== editionDigest(edition)) throw new EditorialError('ISSUE_CHANGED', 'A published issue ID is immutable. Publish a clearly identified correction as a new issue.');
  const published = { ...edition, state: 'published' };
  const next = archive.filter((entry) => entry.id !== edition.id).concat(published).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  await mkdir(dirname(archivePath), { recursive: true });
  const temporary = `${archivePath}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o644 });
  await rename(temporary, archivePath);
  return published;
}

function parseArgs(args) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value.startsWith('--')) {
      if (!['--id', '--archive'].includes(value) || !args[index + 1] || args[index + 1].startsWith('--')) throw new EditorialError('INVALID_ARGUMENT', `Unknown or incomplete option: ${value}.`);
      flags[value.slice(2)] = args[++index];
    } else positional.push(value);
  }
  return { positional, flags };
}

function selectEdition(value, id) {
  if (!Array.isArray(value)) return value;
  if (!id && value.length !== 1) throw new EditorialError('ISSUE_REQUIRED', 'Select an archive edition with --id ID.');
  const edition = id ? value.find((entry) => entry.id === id) : value[0];
  if (!edition) throw new EditorialError('ISSUE_NOT_FOUND', 'The selected edition is not in the archive.');
  return edition;
}

export async function runCli(args = process.argv.slice(2), { env = process.env, output = (value) => process.stdout.write(`${value}\n`) } = {}) {
  const [command, ...rest] = args;
  if (!command || ['help', '--help', '-h'].includes(command)) { output(help); return; }
  const { positional, flags } = parseArgs(rest);
  const [file, outdir] = positional;
  if (!file) throw new EditorialError('INVALID_ARGUMENT', 'An edition file path is required.');
  if (command === 'draft') {
    if (positional.length !== 1) throw new EditorialError('INVALID_ARGUMENT', 'draft accepts one output file.');
    const date = new Date().toISOString().slice(0, 10);
    const draft = {
      id: `${date}-gpu-market-brief`, date, state: 'draft',
      title: '', summary: '',
      stories: Array.from({ length: 3 }, () => ({ title: '', summary: '', whyItMatters: '', watch: '', sourceLabel: '', sourceUrl: '', evidence: [] })),
    };
    await mkdir(dirname(resolve(file)), { recursive: true });
    await writeFile(file, `${JSON.stringify(draft, null, 2)}\n`, { flag: 'wx' });
    output(`Created draft scaffold: ${file}. Fill and verify sources before validation or approval.`);
    return;
  }
  const value = JSON.parse(await readFile(file, 'utf8'));
  if (command === 'validate') {
    let invalid = false;
    for (const edition of Array.isArray(value) ? value : [value]) {
      const result = validateEdition(edition);
      output(JSON.stringify({ id: edition?.id ?? null, ...result }));
      invalid ||= !result.valid;
    }
    if (invalid) throw new EditorialError('INVALID_EDITION', 'Edition validation failed. No content was published or sent.');
    return;
  }
  const edition = selectEdition(value, flags.id);
  assertEdition(edition);
  if (command === 'publish') {
    const archive = flags.archive ? resolve(flags.archive) : resolve('public/newsletter/editions.json');
    const published = await publishEdition(edition, archive);
    output(JSON.stringify({ status: 'published_locally', id: published.id, digest: editionDigest(published), archive, next: 'Build and deploy the website, then verify the public canonical issue page before sending.' }));
    return;
  }
  if (['render', 'prepare'].includes(command)) {
    if (!outdir) throw new EditorialError('INVALID_ARGUMENT', `${command} requires an output directory.`);
    const payload = command === 'prepare' ? prepareBroadcast(edition, env) : null;
    const rendered = payload ? { html: payload.html, text: payload.text } : renderEmail(edition, { siteUrl: env.NEWSLETTER_SITE_URL || undefined, postalAddress: env.NEWSLETTER_POSTAL_ADDRESS || '' });
    await mkdir(outdir, { recursive: true });
    await writeFile(resolve(outdir, `${edition.id}.html`), rendered.html);
    await writeFile(resolve(outdir, `${edition.id}.txt`), rendered.text);
    if (payload) await writeFile(resolve(outdir, `${edition.id}.broadcast.json`), `${JSON.stringify(payload, null, 2)}\n`);
    output(JSON.stringify({ status: payload ? 'payload_prepared' : 'preview_rendered', id: edition.id, outdir: resolve(outdir), externalMutations: false }));
    return;
  }
  if (command === 'send') { output(JSON.stringify(await sendEdition(edition, env))); return; }
  throw new EditorialError('INVALID_ARGUMENT', `Unknown command: ${command}. Run with --help.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    // Never log raw provider responses, credentials, subscriber addresses, or content.
    process.stderr.write(`${error instanceof EditorialError ? `${error.code}: ${error.message}` : 'Editorial operation failed. Check the input file and configuration.'}\n`);
    process.exitCode = 1;
  });
}
