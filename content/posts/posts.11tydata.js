module.exports = {
  layout: 'layouts/post.njk',
  tags: ['post'],
  permalink: ({ page }) => `blog/${page.fileSlug}/index.html`
};
