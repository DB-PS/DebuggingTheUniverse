const siteBtwTemplate = document.createElement('template');
siteBtwTemplate.innerHTML = `
<style>
  :host {
    display: block;
    margin: 1.5rem 0;
  }

  .btw-box {
    border: 1px solid var(--border);
    border-radius: 6px;
    background: color-mix(in srgb, var(--bg-soft) 82%, black 18%);
    opacity: 0.6;
    transition: opacity 0.2s ease;
    overflow: hidden;
  }

  .btw-box.expanded {
    opacity: 1;
  }

  .btw-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.6rem 1rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    font-family: var(--font-inter, "Inter", Helvetica);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text-dim);
  }

  .btw-box.expanded .btw-header {
    color: var(--text);
  }

  .btw-chevron {
    width: 0.9rem;
    height: 0.9rem;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 50%;
    padding: 0.25rem;
    box-sizing: content-box;
  }

  .btw-chevron svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.2s ease;
  }

  .btw-box.expanded .btw-chevron svg {
    transform: rotate(180deg);
  }

  .btw-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.25s ease;
  }

  .btw-box.expanded .btw-body {
    grid-template-rows: 1fr;
  }

  .btw-body-inner {
    overflow: hidden;
    min-height: 0;
  }

  /* Once fully expanded (transition settled), stop clipping so popovers
     like tool-tip aren't cut off by the animation containers. */
  .btw-box.no-clip {
    overflow: visible;
  }

  .btw-box.no-clip .btw-body-inner {
    overflow: visible;
  }

  .btw-content {
    padding: 0 1rem 1rem;
    font-family: var(--font-source-serif, "Source Serif 4", serif);
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--text);
  }

  ::slotted(a), a {
    color: var(--link);
  }
  ::slotted(code), code {
    background: var(--bg);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9em;
  }
</style>
<link rel="stylesheet" id="prism-theme" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">
<div class="btw-box">
  <button type="button" class="btw-header" aria-expanded="false">
    <span class="btw-label">BTW</span>
    <span class="btw-chevron">
      <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
    </span>
  </button>
  <div class="btw-body">
    <div class="btw-body-inner">
      <div class="btw-content">
        <slot></slot>
      </div>
    </div>
  </div>
</div>
`;

class SiteBtw extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(siteBtwTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this._syncPrismTheme();
    const observer = new MutationObserver(() => this._syncPrismTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const box = this.shadowRoot.querySelector('.btw-box');
    const body = this.shadowRoot.querySelector('.btw-body');
    const header = this.shadowRoot.querySelector('.btw-header');
    const label = this.shadowRoot.querySelector('.btw-label');
    const content = this.shadowRoot.querySelector('.btw-content');

    label.textContent = this.getAttribute('title') || 'BTW';

    body.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'grid-template-rows' && box.classList.contains('expanded')) {
        box.classList.add('no-clip');
      }
    });

    header.addEventListener('click', () => {
      const isExpanded = box.classList.toggle('expanded');
      header.setAttribute('aria-expanded', String(isExpanded));
      if (!isExpanded) box.classList.remove('no-clip');
      if (isExpanded) this._runParsers(content);
    });

    if (this.hasAttribute('open')) {
      box.classList.add('expanded', 'no-clip');
      header.setAttribute('aria-expanded', 'true');
      this._runParsers(content);
    }
  }

  _runParsers(content) {
    const highlightCode = () => {
      const codeBlocks = content.querySelectorAll('code[class*="language-"]');
      codeBlocks.forEach(block => window.Prism.highlightElement(block));
    };

    if (window.Prism) {
      highlightCode();
    } else {
      setTimeout(() => {
        if (window.Prism) highlightCode();
      }, 500);
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([content]).catch((err) => console.log('MathJax error: ', err));
    } else {
      setTimeout(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([content]).catch((err) => console.log('MathJax error: ', err));
        }
      }, 500);
    }
  }

  _syncPrismTheme() {
    const savedTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = ['dark', 'gruvbox', 'solarized-dark'].includes(savedTheme);
    const prismLink = this.shadowRoot.getElementById('prism-theme');
    if (prismLink) {
      prismLink.href = isDark
        ? "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css"
        : "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css";
    }
  }
}

if (!customElements.get('site-btw')) {
  customElements.define('site-btw', SiteBtw);
}
