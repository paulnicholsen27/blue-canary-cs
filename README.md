# Blue Canary Web Design

The Blue Canary Web Design website is a static site built with Eleventy and Less. Netlify builds and hosts the site from the `production` branch.

## Ownership and hosting

- **Domain registrar:** Namecheap. The domain is purchased through Namecheap.
- **Hosting and deployment:** Netlify. Netlify manages the production deploy, previews, redirects, serverless functions, and form handling.
- **Source repository:** [github.com/paulnicholsen27/blue-canary-cs](https://github.com/paulnicholsen27/blue-canary-cs)
- **Production domain:** [www.bluecanarywebdesign.com](https://www.bluecanarywebdesign.com)
- **CMS:** Decap CMS at [/admin/](https://www.bluecanarywebdesign.com/admin/), authenticated and connected through DecapBridge.

Do not commit passwords, API keys, OAuth secrets, or other credentials. Access to Namecheap, Netlify, GitHub, and DecapBridge should be transferred separately through the appropriate account owner or password manager.

## Tech stack

- Eleventy 3 for static site generation
- Nunjucks templates and Markdown content
- Less for source stylesheets
- Netlify for builds, hosting, forms, redirects, and functions
- Decap CMS with DecapBridge PKCE authentication
- GitHub for source control and CMS commits

## Prerequisites

Install Node.js and npm. The repository does not currently pin a Node.js version, so use the Node version configured or recommended by the Netlify site settings when available.

Install dependencies after cloning:

```sh
npm install
```

## Local development

Start the Eleventy development server:

```sh
npm run dev
```

This serves the site locally, normally at `http://localhost:8080`, and watches templates and content.

Less source files are compiled into `css/main.css`. Run the CSS watcher in a second terminal while editing Less:

```sh
npm run watch:css
```

If you only need to rebuild the CSS once:

```sh
npm run build:css
```

The CMS interface is available locally at:

```text
http://localhost:8080/admin/
```

CMS authentication and Netlify services may not work correctly on a local server. For CMS changes, use a Netlify deploy preview or the production CMS after confirming the intended branch and permissions.

## Production build

Build the complete site with:

```sh
npm run build
```

The build command:

1. Removes the old `dist/` directory.
2. Compiles and minifies Less into `css/main.css`.
3. Runs Eleventy and writes the generated site to `dist/`.

`dist/` is generated output and is ignored by Git. Edit the source files instead of editing files inside `dist/`.

The Netlify build is configured in `netlify.toml`:

```text
Build command: npm run build
Publish directory: dist
Production branch: production
```

Deploy previews and branch deploys receive `X-Robots-Tag: noindex, nofollow` so they do not compete with the production site in search results.

## Project layout

```text
index.html             Home page
pages/                 Additional page templates
blog/                  Blog index
content/posts/         Blog post Markdown files
_includes/             Shared Nunjucks layouts and partials
_data/site.json        Shared site data
css/*.less             Less source stylesheets
css/main.css           Generated compiled stylesheet
js/                    Browser-side JavaScript
assets/                Images, fonts, logos, and uploaded CMS media
admin/                 Decap CMS interface and configuration
netlify/functions/     Netlify serverless functions
.eleventy.js           Eleventy configuration
netlify.toml           Netlify build and routing configuration
```

## Publishing blog content with Decap CMS

1. Open `/admin/` on the production site.
2. Sign in through DecapBridge.
3. Create or edit a post under **Blog Posts**.
4. Use the editorial workflow to save a draft, review it, and publish it.
5. Confirm that the resulting commit is on the `production` branch and that Netlify has started a deploy.
6. Check the published post and, when relevant, its preview image, metadata, and links.

The CMS configuration is in `admin/config.yml`:

- Posts are stored in `content/posts`.
- Posts use Markdown with frontmatter.
- Uploaded media is stored in `assets/images/uploads`.
- The CMS uses the `git-gateway` backend with DecapBridge PKCE.
- CMS commits are made to the `production` branch.

When editing a post manually, preserve its frontmatter fields: `title`, `description`, `shareImage`, `date`, and `tags`. The Markdown body follows the frontmatter block.

## Editing the site

- Use the files in `pages/`, `index.html`, and `blog/` for page-level markup.
- Use `_includes/` for shared layouts, navigation, footer, and contact components.
- Edit the relevant `.less` file in `css/` for styles, then run `npm run build:css` or the CSS watcher.
- Edit files in `js/` for client-side behavior.
- Add site-wide values to `_data/site.json` when an existing template expects shared data.
- Add images and fonts under `assets/`. CMS-uploaded images belong in `assets/images/uploads`.

## Contact form

The home page contains a Netlify form named `Contact Form`. The browser script in `js/contact-form.js` submits it without a page reload and displays success or error status messages.

Form processing and notification settings are managed in Netlify, not in this repository. Verify the form submissions and notification recipients in the Netlify site dashboard after changing the form markup or deployment settings. The form currently collects name, email, phone, referral source, and message.

## Netlify functions and CMS authentication

Netlify functions live in `netlify/functions/`. The current active CMS configuration uses DecapBridge PKCE. `netlify/functions/oauth.js` contains a GitHub OAuth flow associated with an older CMS configuration that remains commented out in `admin/config.yml`.

Before changing or removing the OAuth function, confirm that no Netlify configuration or CMS workflow still uses it. If the legacy GitHub OAuth flow is re-enabled, it requires these Netlify environment variables:

```text
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

Never put those values in the repository.

## SEO and external services

The site includes canonical URLs, Open Graph and Twitter metadata, JSON-LD schema, a sitemap template, and `robots.txt`. The site also references external services including Google Analytics/Ads, Google reCAPTCHA support in the form script, Calendly, Google profile links, LinkedIn, and client websites. Check those integrations when changing domains, branding, analytics, or contact workflows.

## Troubleshooting

### The local site does not reflect Less changes

Run `npm run watch:css` in a second terminal, or run `npm run build:css` manually. `npm run dev` does not itself compile Less source files.

### A deploy fails on Netlify

Run `npm run build` locally first, then inspect the Netlify deploy log. Check the Node.js version, dependency installation, Eleventy output, and whether the publish directory is still `dist`.

### The CMS cannot sign in

Check the production site URL, DecapBridge site configuration, GitHub repository and branch permissions, and the Netlify deploy that serves `/admin/`. Do not troubleshoot by adding secrets to Git.

### A form submission is missing

Check the Netlify form dashboard and notification settings. Then verify that the deployed HTML still contains `data-netlify="true"`, the hidden `form-name` field, and the expected form name.

## Changes and releases

Use a feature branch for site changes, test the production build locally, and open a pull request against `production`. After merge, monitor the Netlify deploy and verify the affected page on the production domain.

For content-only changes made through Decap CMS, verify the generated page after the CMS-triggered deploy completes.

## Important details to confirm

The repository does not document the following operational details yet. A site owner should record them in the team's private documentation or password manager, rather than committing secrets here:

- The Netlify site name and site owner/team.
- Who owns or administers the Namecheap, Netlify, GitHub, and DecapBridge accounts.
- Namecheap DNS records and whether Namecheap nameservers point to Netlify.
- The exact Node.js version used by Netlify and local development.
- Netlify form notification recipients and spam-protection settings.
- The process for restoring DecapBridge access or changing CMS administrators.
- Analytics, Google Search Console, reCAPTCHA, Calendly, and social-profile account owners.
- Backup and rollback expectations for the `production` branch and Netlify deploys.
- Whether the legacy `netlify/functions/oauth.js` flow can be removed safely.
