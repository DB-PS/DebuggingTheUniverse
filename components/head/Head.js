function formatDate(str, isFullFormat) {
  // str: YYYY-MM-DD:HH-MM
  var parts = str.split(':');
  var dateParts = parts[0].split('-');
  
  var months = [
    'Jan','Feb','Mar','Apr','May','Jun',
    'Jul','Aug','Sep','Oct','Nov','Dec'
  ];
  
  var y = dateParts[0];
  var m = months[parseInt(dateParts[1], 10) - 1];
  var d = dateParts[2];

  if (!isFullFormat) {
    return m + ' ' + d + ', ' + y;
  }

  var timeParts = parts[1].split('-');
  var hours = parseInt(timeParts[0], 10);
  var minutes = timeParts[1];
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  
  return y + ' ' + m + ' ' + d + ' ' + hours + ':' + minutes + ' ' + ampm;
}

async function fetchBlogData() {
  if (window._blogData) return window._blogData;
  const isRoot = document.querySelector('site-head')?.hasAttribute('root');
  const path = isRoot ? 'blogs.json' : '../blogs.json';
  try {
    const response = await fetch(path);
    window._blogData = await response.json();
    return window._blogData;
  } catch (e) {
    console.error("Could not fetch blogs.json", e);
    return [];
  }
}

function getCurrentPostFolder() {
  const path = window.location.pathname;
  const parts = path.split('/').filter(p => p.length > 0);
  return parts[parts.length - 1] === 'index.html' ? parts[parts.length - 2] : parts[parts.length - 1];
}

class BlogHead extends HTMLElement {
  async connectedCallback() {
    const isRoot = this.hasAttribute('root');
    const prefix = isRoot ? '' : '../';

    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1';
      document.head.appendChild(viewport);
    }

    if (isRoot) {
      document.title = this.getAttribute('title') || 'Debugging the Universe';
    } else {
      const blogs = await fetchBlogData();
      const folder = getCurrentPostFolder();
      const post = blogs.find(b => b.date === decodeURIComponent(folder));
      if (post) {
        document.title = `${post.title} | Debugging the Universe`;
      }
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${prefix}style.css`;
    document.head.appendChild(link);

    // Single asset root reference
    document.documentElement.style.setProperty('--logo-url', `url("${prefix}logo.svg")`);

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = `${prefix}favicon.svg`;
    document.head.appendChild(favicon);

    if (!window.MathJax) {
      window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] } };
      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
      s.async = true;
      document.head.appendChild(s);
    }


    const script = document.createElement('script');
    script.src = `${prefix}main.js`;
    script.defer = true;
    document.head.appendChild(script);

    const colorUtilsScript = document.createElement('script');
    colorUtilsScript.src = `${prefix}libs/color-utils.js`;
    colorUtilsScript.defer = true;
    document.head.appendChild(colorUtilsScript);

    const mathUtilsScript = document.createElement('script');
    mathUtilsScript.src = `${prefix}libs/math-utils.js`;
    mathUtilsScript.defer = true;
    document.head.appendChild(mathUtilsScript);

    const suspenseScript = document.createElement('script');
    suspenseScript.src = `${prefix}components/suspense/Suspense.js`;
    suspenseScript.defer = true;
    document.head.appendChild(suspenseScript);

    const sideNoteScript = document.createElement('script');
    sideNoteScript.src = `${prefix}components/side_note/SideNote.js`;
    sideNoteScript.defer = true;
    document.head.appendChild(sideNoteScript);

    const toolTipScript = document.createElement('script');
    toolTipScript.src = `${prefix}components/tool_tip/ToolTip.js`;
    toolTipScript.defer = true;
    document.head.appendChild(toolTipScript);

    const mathboxScript = document.createElement('script');
    mathboxScript.src = `${prefix}components/mathbox/MathBox.js`;
    mathboxScript.defer = true;
    document.head.appendChild(mathboxScript);

    const themeSwitcherScript = document.createElement('script');
    themeSwitcherScript.src = `${prefix}components/theme_switcher/ThemeSwitcher.js`;
    themeSwitcherScript.defer = true;
    document.head.appendChild(themeSwitcherScript);

    const footerScript = document.createElement('script');
    footerScript.src = `${prefix}components/footer/Footer.js`;
    footerScript.defer = true;
    document.head.appendChild(footerScript);

    const bannerScript = document.createElement('script');
    bannerScript.src = `${prefix}components/banner/Banner.js`;
    bannerScript.defer = true;
    document.head.appendChild(bannerScript);

    // Theme initialization
    const savedTheme = localStorage.getItem('blog-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initial Prism theme sync
    if (!window.Prism) {
      const isDark = ['dark', 'gruvbox', 'solarized-dark'].includes(savedTheme);
      const prismStyles = document.createElement('link');
      prismStyles.rel = 'stylesheet';
      prismStyles.href = isDark 
        ? "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css"
        : "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css";
      prismStyles.id = 'prism-theme';
      document.head.appendChild(prismStyles);

      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js";
      s.async = true;
      s.dataset.manual = "true";
      s.onload = () => {
        // Load autoloader to support languages like Python
        const autoloader = document.createElement('script');
        autoloader.src = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js";
        autoloader.onload = () => {
          Prism.highlightAll();
        };
        document.head.appendChild(autoloader);
      };
      document.head.appendChild(s);
    }
  }
}

if (!customElements.get('site-head')) {
  customElements.define('site-head', BlogHead);
}
