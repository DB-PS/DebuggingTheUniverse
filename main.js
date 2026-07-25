// Index page logic
if (document.getElementById('blog-list')) {
  fetch('blogs.json')
    .then(function(r) { return r.json(); })
    .then(function(blogs) {
      blogs.sort(function(a, b) {
        return b.date.localeCompare(a.date);
      });

      var list = document.getElementById('blog-list');
      list.innerHTML = '';

      if (blogs.length === 0) {
        list.innerHTML = '<li style="font-style:italic;color:#555;">No posts yet.</li>';
        return;
      }

      blogs.forEach(function(blog) {
        var li = document.createElement('li');
        li.className = 'blog-entry';

        var tagsHtml = '';
        if (blog.tags && blog.tags.length) {
          tagsHtml = '<div class="blog-tags">' + blog.tags.map(function(t) {
            return '<span class="tag">' + t + '</span>';
          }).join(' ') + '</div>';
        }

        var href = encodeURIComponent(blog.date) + '/';

        li.innerHTML =
          '<div class="blog-entry-header">' +
            '<span class="blog-entry-title">' +
              '<a href="' + href + '">' + blog.title + '</a>' +
            '</span>' +
            '<span class="blog-entry-dash"></span>' +
            '<time class="blog-entry-date" datetime="' + blog.date + '">' + formatDate(blog.date, false) + '</time>' +
          '</div>' +
          tagsHtml;

        list.appendChild(li);
      });
    })
    .catch(function() {
      document.getElementById('blog-list').innerHTML =
        '<li style="color:#900;">Could not load posts. Serve this directory over HTTP (e.g. <code>python3 -m http.server</code>).</li>';
    });
}
