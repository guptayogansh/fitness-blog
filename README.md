# Prime Routine — a fitness blog

A static fitness blog: plain HTML, CSS and vanilla JS. No build step, no dependencies, no framework.
Drop it on GitHub Pages and it works.

## What's in it

```
index.html          Home — hero, article grid, live search + tag filter, subscribe form
about.html          About page
404.html            Self-contained not-found page
posts/              Six full articles
admin.html          Passphrase-locked editor — writes posts + images via the GitHub API
admin-key.json      GitHub token, encrypted with your passphrase (created by the setup script)
tools/              One-time setup script that produces admin-key.json
assets/css/style.css
assets/js/main.js   Theme toggle, search/filter, form handling
.nojekyll           Tells Pages to serve files as-is (skip the Jekyll build)
```

Features: light/dark theme (follows the OS, with a manual toggle that persists), client-side
search and topic filtering, responsive down to phone widths, keyboard-accessible, and it degrades
to a perfectly readable site with JavaScript off.

## Preview it locally

```bash
cd fitness-blog
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly with `file://` also works.

## Publish to GitHub Pages

1. Create an empty repo on github.com — call it `fitness-blog` (any name works).
2. Push this folder:

   ```bash
   cd fitness-blog
   git remote add origin https://github.com/<your-username>/fitness-blog.git
   git branch -M main
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment**.
   Set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Wait about a minute. Your site is live at
   `https://<your-username>.github.io/fitness-blog/`.

Every `git push` to `main` redeploys automatically.

> Want the site at `https://<your-username>.github.io/` instead (no `/fitness-blog` suffix)?
> Name the repo exactly `<your-username>.github.io`.

## Making it yours

| To change | Edit |
| --- | --- |
| Site name and logo | The `.brand` block in the header of each page |
| Colours | The `:root` variables at the top of `assets/css/style.css` — light and dark blocks |
| Contact email | `about.html` |

**Adding a post.** Either use the admin editor (below), or by hand: copy any file in `posts/`, rewrite
the content, then add a matching `<li class="card">` to the grid in `index.html`. Two attributes drive
search and filtering:

- `data-post` — lowercase keywords the search box matches against
- `data-tags` — comma-separated, must match the `data-tag` values on the filter buttons

## The admin editor

`admin.html` is a browser editor that writes posts and images straight to this repo through the
GitHub API — no server, no CMS, no third-party service.

It works by keeping the GitHub token in `admin-key.json`, encrypted with a passphrase
(PBKDF2-SHA256, 600k iterations → AES-256-GCM). That file is public and safe to commit: it holds
only ciphertext. There is no login check to bypass, because the passphrase *is* the decryption key —
without it the token cannot be recovered from the file at all. The decrypted token lives in a
JavaScript variable and nowhere else, so closing the tab logs you out.

**One-time setup**

1. Create a fine-grained token at **github.com → Settings → Developer settings → Personal access
   tokens → Fine-grained tokens**. Set *Repository access* to **Only select repositories →
   fitness-blog**, and under *Permissions → Repository permissions* set **Contents: Read and write**.
   Nothing else. That token can touch this one repo and nothing else on the account.
2. Encrypt it:

   ```bash
   node tools/encrypt-token.mjs
   ```

3. Commit and push the `admin-key.json` it writes.

**Writing a post.** Go to `/admin.html`, unlock, fill in the details, write the body, drop in
pictures, hit Publish. It commits the post, the images, and the home-page card in one go; Pages
redeploys in about a minute.

The body uses a small Markdown subset: `##` / `###` headings, `- ` and `1. ` lists, `> ` quotes,
`**bold**`, `*italic*`, `[text](url)`, `![caption](picture.jpg)`, and `::: Title … :::` for a callout
box. Pictures are resized to 1600px and compressed in the browser before upload.

If the token ever leaks, revoke it on GitHub and re-run the setup — the blast radius is this repo only.

**The subscribe form** is a demo — it shows a confirmation and discards the address. To make it real,
point it at a service that accepts a plain form POST (Buttondown, ConvertKit, Formspree, Mailchimp)
by giving the `<form>` an `action` and removing the `data-subscribe` handler in `assets/js/main.js`.

**Custom domain?** Add a `CNAME` file containing just your domain, then set it under Settings → Pages.

## Note on the content

The six articles are real, carefully written training content, but they're general information —
not medical, coaching, or nutrition advice for any individual. The About page says as much; keep
that disclaimer if you publish as-is.

## License

MIT for the code. Do what you like with it.
