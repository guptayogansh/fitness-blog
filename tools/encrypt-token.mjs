#!/usr/bin/env node
/**
 * One-time setup: encrypts a GitHub token with your passphrase and writes
 * admin-key.json, which admin.html decrypts in the browser.
 *
 * The output file is safe to commit — it holds only ciphertext. Without the
 * passphrase there is nothing in it to steal.
 *
 *   node tools/encrypt-token.mjs
 */
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const REPO = 'guptayogansh/fitness-blog';
const ITERATIONS = 600000;
const OUT = 'admin-key.json';

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

/* Masking only means something at a real keyboard. Piped input gets read
   in one go instead — readline drops queued lines between sequential
   questions when stdin is not a terminal. */
const interactive = Boolean(process.stdin.isTTY);

let rl = null;          /* interactive only */
let queued = [];        /* piped only */
let masking = false;
let prompt = '';

if (interactive) {
  /* One interface for every question: closing it would tear down stdin, and
     the next prompt would then read nothing and hang. */
  rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (chunk) => {
    if (!masking) { rl.output.write(chunk); return; }
    /* Redraw the line as the prompt plus one star per typed character, so
       backspace and paste both stay honest about the length. */
    rl.output.write('\x1b[2K\x1b[200D' + prompt + '*'.repeat(rl.line.length));
  };
} else {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  queued = Buffer.concat(chunks).toString('utf8').split('\n');
}

/* Reads a line while masking it, so secrets stay out of your scrollback,
   your shell history, and the shoulder of whoever is behind you. */
function askSecret(question) {
  if (!interactive) {
    process.stdout.write(question + '\n');
    return Promise.resolve((queued.shift() || '').trim());
  }
  return new Promise((resolve) => {
    prompt = question;
    rl.question(question, (answer) => {
      masking = false;
      rl.output.write('\n');
      resolve(answer.trim());
    });
    masking = true;
  });
}

function fail(message) {
  masking = false;
  if (rl) rl.close();
  console.error(`\n\x1b[31m${message}\x1b[0m`);
  console.error('Nothing was written.\n');
  process.exit(1);
}

console.log(`
${bold('Prime Routine — admin setup')}

This encrypts a GitHub token with a passphrase of your choosing and writes
${bold(OUT)}. That file is public and safe to commit: it holds only
ciphertext, and your passphrase is the only thing that can unlock it.

Two things to enter. Both are hidden as you type.
`);

/* ---------- 1. the token ---------- */
console.log(`${bold('Step 1 of 2 — the GitHub token')}
${dim('This is what lets the editor write posts into the repo. Create one at:')}
${dim('  https://github.com/settings/personal-access-tokens/new')}
${dim('  · Repository access  → Only select repositories → fitness-blog')}
${dim('  · Permissions → Repository permissions → Contents: Read and write')}
${dim('It looks like  github_pat_11ABCDE…  and is shown on GitHub only once.')}
`);

const token = await askSecret('Paste the GitHub token here: ');

if (!token) fail('No token entered.');
if (!/^(github_pat_|ghp_|gho_)/.test(token)) {
  fail(`That does not look like a GitHub token — it should start with "github_pat_" (fine-grained) or "ghp_" (classic).\nYou entered ${token.length} characters starting with "${token.slice(0, 4)}".`);
}
console.log(dim(`  ✓ Got a ${token.length}-character token.\n`));

/* ---------- 2. the passphrase ---------- */
console.log(`${bold('Step 2 of 2 — the passphrase')}
${dim('This is what you will type at primeroutine.co.in/admin.html to unlock')}
${dim('the editor. It is the only thing protecting the token, so use the long')}
${dim('one you were given. If you lose it, nothing can recover it — you would')}
${dim('just run this script again with a fresh token and a new passphrase.')}
`);

const passphrase = await askSecret('Enter the passphrase: ');

if (!passphrase) fail('No passphrase entered.');
if (passphrase.length < 20) {
  fail(`That passphrase is ${passphrase.length} characters. Use at least 20 — ${OUT} is public, so a short one can be cracked offline at leisure.`);
}

const confirm = await askSecret('Type the passphrase again to confirm: ');
if (confirm !== passphrase) fail('The two passphrases do not match.');

if (rl) rl.close();

console.log(dim(`  ✓ Passphrase confirmed (${passphrase.length} characters).\n`));

/* ---------- encrypt ---------- */
process.stdout.write(`Deriving the key (${ITERATIONS.toLocaleString()} PBKDF2 rounds)… `);

const salt = randomBytes(16);
const iv = randomBytes(12);
const started = Date.now();
const key = pbkdf2Sync(passphrase, salt, ITERATIONS, 32, 'sha256');

const cipher = createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);

/* WebCrypto expects the GCM auth tag appended to the ciphertext. */
const payload = Buffer.concat([body, cipher.getAuthTag()]);

writeFileSync(OUT, JSON.stringify({
  v: 1,
  repo: REPO,
  kdf: 'PBKDF2-SHA256',
  iterations: ITERATIONS,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ct: payload.toString('base64')
}, null, 2) + '\n');

console.log(`done in ${Date.now() - started}ms.`);
console.log(`
${bold('✓ Wrote ' + OUT)} — ${payload.length} bytes of ciphertext, AES-256-GCM.

Next:
  git add ${OUT} && git commit -m "Add encrypted admin key" && git push

Then open ${bold('https://primeroutine.co.in/admin.html')} and unlock with your passphrase.
`);
