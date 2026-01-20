const rssPlugin = require('@11ty/eleventy-plugin-rss');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  // Copy existing static assets
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('css');
  eleventyConfig.addPassthroughCopy('js');
  eleventyConfig.addPassthroughCopy('robots.txt');
  eleventyConfig.addPassthroughCopy('sitemap.xml');

  // Decap CMS
  eleventyConfig.addPassthroughCopy('admin');

  eleventyConfig.addFilter('readableDate', (value) => {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  });

  eleventyConfig.addFilter('dateToRfc3339', (value) => {
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  });

  return {
    dir: {
      input: '.',
      output: 'dist',
      includes: '_includes',
      data: '_data'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: false
  };
};
