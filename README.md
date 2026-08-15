# Iron & Interval — a fitness blog

A static fitness blog: plain HTML, CSS and vanilla JS. No build step, no dependencies, no framework.
Drop it on GitHub Pages and it works.

## What's in it

```
index.html          Home — hero, article grid, live search + tag filter, subscribe form
about.html          About page
404.html            Self-contained not-found page
posts/              Six full articles
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

**Adding a post.** Copy any file in `posts/`, rewrite the content, then add a matching `<li class="card">`
to the grid in `index.html`. Two attributes drive search and filtering:

- `data-post` — lowercase keywords the search box matches against
- `data-tags` — comma-separated, must match the `data-tag` values on the filter buttons

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
