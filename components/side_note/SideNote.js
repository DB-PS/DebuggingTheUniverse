const sideNoteTemplate = document.createElement('template');
sideNoteTemplate.innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
    height: 0;
    overflow: visible;
  }

  .sidenote {
    position: absolute;
    left: calc(100% + 2.5rem);
    top: 0;
    width: 220px;
    font-family: var(--font-source-serif, "Source Serif 4", serif);
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--text-dim);
    border-left: 2px solid var(--border);
    padding-left: 1rem;
    pointer-events: auto;
    user-select: auto;
  }

  @media (max-width: 1100px) {
    :host {
      height: auto;
      margin: 1.5rem 0;
    }
    .sidenote {
      position: static;
      width: auto;
      background: var(--bg-soft);
      padding: 0.8rem 1rem;
      border-radius: 0 4px 4px 0;
    }
  }

  /* Support for inner elements like code/links */
  ::slotted(a), a {
    color: var(--link);
  }
  ::slotted(code), code {
    background: var(--bg-soft);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9em;
  }
</style>
<link rel="stylesheet" id="prism-theme" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">
<div class="sidenote">
  <slot></slot>
</div>
`;

class BlogSideNote extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(sideNoteTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this._syncPrismTheme();
    const observer = new MutationObserver(() => this._syncPrismTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const noteSelector = this.getAttribute('note');
    let container = this.shadowRoot.querySelector('.sidenote');
    if (noteSelector) {
      const targetEl = document.querySelector(noteSelector);
      if (targetEl) {
        // Find the inner .sidenote container and inject HTML
        container.innerHTML = targetEl.innerHTML;
      }
    }

    // Slotted content might need explicit triggering for Prism/MathJax
    // because standard DOM events might miss Shadow DOM boundaries.
    const runParsers = () => {
      const highlightCode = () => {
        const codeBlocks = this.shadowRoot.querySelectorAll('code[class*="language-"]');
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
        window.MathJax.typesetPromise([container]).catch((err) => console.log('MathJax error: ', err));
      } else {
        setTimeout(() => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([container]).catch((err) => console.log('MathJax error: ', err));
          }
        }, 500);
      }
    };

    // Run once immediately, and maybe again if loaded late
    runParsers();
    setTimeout(runParsers, 500);
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

if (!customElements.get('side-note')) {
  customElements.define('side-note', BlogSideNote);
}
