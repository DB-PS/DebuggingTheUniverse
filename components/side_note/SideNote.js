const _instances = [];
let _reflowScheduled = false;
const _mobileQuery = window.matchMedia('(max-width: 1100px)');
const NOTE_GAP = 16;

function _reflowAll() {
  _reflowScheduled = false;
  if (_mobileQuery.matches) return;

  const boxes = _instances
    .filter(instance => instance.isConnected)
    .sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    })
    .map(instance => instance.shadowRoot.querySelector('.sidenote'))
    .filter(Boolean);

  let minTop = -Infinity;
  boxes.forEach(box => {
    box.style.transform = '';
    const rect = box.getBoundingClientRect();
    const actualTop = Math.max(rect.top, minTop);
    const offset = actualTop - rect.top;
    if (offset > 0.5) {
      box.style.transform = `translateY(${offset}px)`;
    }
    minTop = actualTop + rect.height + NOTE_GAP;
  });
}

function scheduleReflow() {
  if (_reflowScheduled) return;
  _reflowScheduled = true;
  requestAnimationFrame(_reflowAll);
}

let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(scheduleReflow, 150);
});

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
    transition: transform 0.2s ease;
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

  .sidenote-content {
    overflow: hidden;
  }

  .sidenote-content.collapsible.collapsed {
    max-height: calc(1.5em * 3);
    -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 1.5em), transparent 100%);
            mask-image: linear-gradient(to bottom, black calc(100% - 1.5em), transparent 100%);
  }

  .sidenote-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    margin-top: 0.5rem;
    width: 1.6rem;
    height: 1.6rem;
    color: var(--text);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .sidenote-toggle.visible {
    display: inline-flex;
  }

  .sidenote-toggle:hover {
    background: var(--border);
  }

  .sidenote-toggle:active {
    background: var(--text-dim);
  }

  .sidenote-toggle svg {
    width: 0.7rem;
    height: 0.7rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.15s ease;
  }

  .sidenote-toggle.expanded svg {
    transform: rotate(180deg);
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
  <div class="sidenote-content">
    <slot></slot>
  </div>
  <button type="button" class="sidenote-toggle" aria-label="Show more">
    <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
  </button>
</div>
`;

class BlogSideNote extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(sideNoteTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    _instances.push(this);
    this._syncPrismTheme();
    const observer = new MutationObserver(() => this._syncPrismTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const noteSelector = this.getAttribute('note');
    const content = this.shadowRoot.querySelector('.sidenote-content');
    const container = content;
    if (noteSelector) {
      const targetEl = document.querySelector(noteSelector);
      if (targetEl) {
        content.innerHTML = targetEl.innerHTML;
      }
    }

    this._setupCollapse();

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
        window.MathJax.typesetPromise([container])
          .then(() => this._setupCollapse())
          .catch((err) => console.log('MathJax error: ', err));
      } else {
        setTimeout(() => {
          if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([container])
              .then(() => this._setupCollapse())
              .catch((err) => console.log('MathJax error: ', err));
          }
        }, 500);
      }
    };

    // Run once immediately, and maybe again if loaded late
    runParsers();
    setTimeout(() => {
      runParsers();
      this._setupCollapse();
    }, 500);
  }

  disconnectedCallback() {
    const index = _instances.indexOf(this);
    if (index !== -1) _instances.splice(index, 1);
    scheduleReflow();
  }

  _setupCollapse() {
    const content = this.shadowRoot.querySelector('.sidenote-content');
    const toggle = this.shadowRoot.querySelector('.sidenote-toggle');
    if (!content || !toggle) return;

    if (!this._toggleBound) {
      this._toggleBound = true;
      toggle.addEventListener('click', () => {
        const isCollapsed = content.classList.toggle('collapsed');
        toggle.classList.toggle('expanded', !isCollapsed);
        toggle.setAttribute('aria-label', isCollapsed ? 'Show more' : 'Show less');
        scheduleReflow();
      });
    }

    // Measure against the natural (uncollapsed) height to decide if collapsing is needed.
    content.classList.remove('collapsible', 'collapsed');
    const lineHeight = parseFloat(getComputedStyle(content).lineHeight) || 0;
    const maxCollapsedHeight = lineHeight * 3;
    const needsCollapse = content.scrollHeight > maxCollapsedHeight + 1;

    toggle.classList.toggle('visible', needsCollapse);
    if (needsCollapse) {
      content.classList.add('collapsible', 'collapsed');
      toggle.classList.remove('expanded');
      toggle.setAttribute('aria-label', 'Show more');
    }

    scheduleReflow();
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
