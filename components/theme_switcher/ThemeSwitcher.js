const themeSwitcherTemplate = document.createElement('template');
themeSwitcherTemplate.innerHTML = `
<style>
  :host {
    display: inline-block;
    vertical-align: middle;
    margin-left: 0.4rem;
    position: relative;
    top: -1px;
  }

  .theme-cycle-btn {
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    cursor: pointer;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    color: var(--text);
  }

  .theme-cycle-btn svg {
    display: block;
  }

  .theme-cycle-btn:hover {
    opacity: 1;
  }
</style>
<button class="theme-cycle-btn" title="Cycle Theme" aria-label="Cycle Theme"></button>
`;

class ThemeSwitcher extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(themeSwitcherTemplate.content.cloneNode(true));
    this._btn = this.shadowRoot.querySelector('.theme-cycle-btn');
    
    this.themes = ['light', 'dark', 'gruvbox', 'solarized-dark'];
    this.icons = {
      light: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
      dark: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
      gruvbox: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
      'solarized-dark': `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path><circle cx="12" cy="12" r="4"></circle></svg>`
    };
  }

  connectedCallback() {
    this._btn.addEventListener('click', () => {
      const nextTheme = this.getNextTheme();
      this.setTheme(nextTheme);
    });
    this.render();
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 
           localStorage.getItem('blog-theme') || 
           'light';
  }

  getNextTheme() {
    const current = this.getCurrentTheme();
    const index = this.themes.indexOf(current);
    return this.themes[(index + 1) % this.themes.length];
  }

  render() {
    const currentTheme = this.getCurrentTheme();
    this._btn.innerHTML = this.icons[currentTheme] || this.icons.light;
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blog-theme', theme);
    this.updatePrismTheme(theme);
    this.render();
  }

  updatePrismTheme(theme) {
    const prismLink = document.getElementById('prism-theme');
    if (!prismLink) return;

    // Map blog themes to Prism themes
    const isDark = ['dark', 'gruvbox', 'solarized-dark'].includes(theme);
    const prismThemeUrl = isDark 
      ? "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css"
      : "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css";
    
    prismLink.href = prismThemeUrl;
  }
}

if (!customElements.get('theme-switcher')) {
  customElements.define('theme-switcher', ThemeSwitcher);
}
