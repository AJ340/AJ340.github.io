# andres-new-portfolio-site

Static portfolio/resume site. No build step — plain HTML/CSS/JS.

## Running locally

Serve the directory over HTTP (opening the HTML files directly with `file://`
breaks relative asset paths and the theme toggle's `localStorage` usage):

```bash
python3 -m http.server 8420
```

Then open [http://localhost:8420](http://localhost:8420).

## Structure

- `index.html`, `resume.html`, `projects.html`, `blog.html`, `support.html`, `contact.html` — top-level pages
- `blog/` — individual blog posts (add an entry to `BLOG_POSTS` in `assets/js/main.js` plus a new HTML file to publish one)
- `demos/nightfall/` — playable canvas game demo, embedded live rather than screenshotted
- `assets/css/style.css` — styling, including the light/dark theme palettes
- `assets/js/main.js` — theme toggle logic + blog post data

## Adding a blog post

Posts aren't hardcoded into `blog.html` — it has an empty `<div id="blog-list">`
that gets filled in at page load by `renderBlogList()` in `assets/js/main.js`,
which reads from the `BLOG_POSTS` array there. The homepage's "latest post"
card (`renderLatestPostPreview()`) pulls from the same array, always showing
whichever entry has the newest `date`. No build step — just two changes:

1. **Write the post HTML** — copy an existing file in `blog/` (e.g.
   `blog/nas-homelab.html`) as a template. It already has the right relative
   paths back to root (`../index.html`, `../assets/css/style.css`, etc).
   Swap in your `<h1>`, the eyebrow date/category, and body content inside
   `.post-body`. Optionally update the prev/next links at the bottom of the
   post to chain it to the post before/after it.

2. **Add an entry to `BLOG_POSTS`** in `assets/js/main.js`:

   ```js
   {
     slug: 'blog/your-new-post.html',
     date: '2026-07-26',
     title: 'Your Post Title',
     excerpt: 'One or two sentences shown in the list preview.',
     tags: ['tag1', 'tag2']
   }
   ```

The array is sorted by `date` automatically, so a newer date bubbles to the
top of `blog.html` and becomes the homepage's featured post with no other
changes needed.

## Known TODOs

- `resume.html` — placeholder bullets for the Citi AVP role need real content
- `contact.html` — needs a real Formspree form ID
- `support.html` — `EDIT_ME` donation links (Buy Me a Coffee / GitHub Sponsors / Ko-fi) need real URLs
