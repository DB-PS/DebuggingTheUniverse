const toolTipTemplate = document.createElement('template');
toolTipTemplate.innerHTML = `
<style>
  :host {
    display: inline-block;
    position: relative;
    cursor: help;
    border-bottom: 1px dotted var(--text-dim);
  }

  .tooltip-content {
    visibility: hidden;
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    width: 280px;
    background-color: var(--bg-soft);
    color: var(--text);
    text-align: left;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.8rem 1rem;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: var(--font-source-serif, "Source Serif 4", serif);
    font-size: 0.85rem;
    line-height: 1.5;
    pointer-events: none;
  }

  /* Triangle pointer */
  .tooltip-content::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--border) transparent transparent transparent;
  }

  :host(:hover) .tooltip-content {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  ::slotted([slot="tip"]) {
    display: block;
  }

  ::slotted(code), code {
    background: rgba(0,0,0,0.05);
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
  }

  /* Themes handle text color, but we ensure code visibility */
  :host-context([data-theme="dark"]) code,
  :host-context([data-theme="gruvbox"]) code,
  :host-context([data-theme="solarized-dark"]) code,
  :root[data-theme="dark"] ::slotted(code),
  :root[data-theme="gruvbox"] ::slotted(code),
  :root[data-theme="solarized-dark"] ::slotted(code) {
    background: rgba(255,255,255,0.1);
  }
</style>
<link rel="stylesheet" id="prism-theme" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css">
<slot></slot>
<div class="tooltip-content" id="tooltip">
  <slot name="tip"></slot>
</div>
`;

class BlogToolTip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(toolTipTemplate.content.cloneNode(true));
    this._tooltip = this.shadowRoot.getElementById('tooltip');
  }

  connectedCallback() {
    this.addEventListener('mouseenter', this._adjustPosition.bind(this));

    // Sync initial prism theme for the tooltip
    this._syncPrismTheme();
    
    // Listen for global theme changes to keep popup code highlighted correctly
    const observer = new MutationObserver(() => this._syncPrismTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const tipSelector = this.getAttribute('tip');
    if (tipSelector) {
      const targetEl = document.querySelector(tipSelector);
      if (targetEl) {
        // Use the target's innerHTML as the tooltip content
        this._tooltip.innerHTML = targetEl.innerHTML;
        
        // Trigger PrismJS on the newly injected content explicitly
        const highlightCode = () => {
          const codeBlocks = this._tooltip.querySelectorAll('code[class*="language-"]');
          codeBlocks.forEach(block => window.Prism.highlightElement(block));
        };

        if (window.Prism) {
          highlightCode();
        } else {
          setTimeout(() => {
            if (window.Prism) highlightCode();
          }, 500);
        }
        
        // Trigger MathJax on the newly injected content if it exists
        if (window.MathJax && window.MathJax.typesetPromise) {
          window.MathJax.typesetPromise([this._tooltip]).catch((err) => console.log('MathJax error: ', err));
        } else {
          setTimeout(() => {
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise([this._tooltip]).catch((err) => console.log('MathJax error: ', err));
            }
          }, 500);
        }
      }
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

  _adjustPosition() {
    const rect = this._tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.left < 10) {
      this._tooltip.style.left = '0';
      this._tooltip.style.transform = 'translateX(0)';
    } else if (rect.right > viewportWidth - 10) {
      this._tooltip.style.left = 'auto';
      this._tooltip.style.right = '0';
      this._tooltip.style.transform = 'translateX(0)';
    }
  }
}

if (!customElements.get('tool-tip')) {
  customElements.define('tool-tip', BlogToolTip);
}
