module.exports = {
  layout: 'layouts/post.njk',
  tags: ['post'],
  ogType: 'article',
  permalink: ({ page }) => `blog/${page.fileSlug}/index.html`
};
