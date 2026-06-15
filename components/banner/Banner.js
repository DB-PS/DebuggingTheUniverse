class BlogBanner extends HTMLElement {
  async connectedCallback() {
    const blogs = await fetchBlogData();
    const folder = getCurrentPostFolder();
    const post = blogs.find(b => b.date === decodeURIComponent(folder));

    if (post) {
      const formattedDate = formatDate(post.date, true);
      const tagsHtml = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('\n          ');
      this.innerHTML = `
      <a class="back-link" href="../">&larr; index</a>
      <header class="post-header">
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">
          <time datetime="${post.date}">${formattedDate}</time>
          <span class="post-tags">
            ${tagsHtml}
          </span>
        </div>
      </header>
      `;
    } else {
      const title = this.getAttribute('title') || 'Post Title';
      const date = this.getAttribute('date') || 'YYYY-MM-DD:HH-MM';
      const formattedDate = date.includes('YYYY') ? date : formatDate(date, true);
      const tagsAttr = this.getAttribute('tags') || '';
      const tags = tagsAttr.split(' ').filter(t => t.length > 0);
      const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('\n          ');

      this.innerHTML = `
      <a class="back-link" href="../">&larr; index</a>
      <header class="post-header">
        <h1 class="post-title">${title}</h1>
        <div class="post-meta">
          <time datetime="${date}">${formattedDate}</time>
          <span class="post-tags">
            ${tagsHtml}
          </span>
        </div>
      </header>
      `;
    }
  }
}

if (!customElements.get('site-banner')) {
  customElements.define('site-banner', BlogBanner);
}
