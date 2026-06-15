const suspenseTemplate = document.createElement('template');
suspenseTemplate.innerHTML = `
<style>
  :host {
    display: block;
    position: relative;
    margin-bottom: 1rem;
  }

  #container {
    position: relative;
    width: 100%;
  }

  #content-wrapper {
    transition: filter 0.3s ease;
    user-select: none;
  }

  :host([revealed]) #content-wrapper {
    filter: none;
    user-select: auto;
  }

  #content-wrapper.hidden {
    filter: blur(25px);
    pointer-events: none;
  }

  #overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    font-family: var(--font-inter, "Inter", Helvetica);
    font-size: 0.9rem;
    color: var(--text);
    background: rgba(var(--bg-rgb, 255, 255, 255), 0.1);
    border: 1px dashed var(--border);
    border-radius: 4px;
    transition: opacity 0.3s;
  }

  :host([revealed]) #overlay {
    opacity: 0;
    pointer-events: none;
  }

  #toggle-btn {
    position: absolute;
    top: 0;
    left: calc(100% + 10px);
    background: none;
    border: none;
    padding: 5px;
    cursor: pointer;
    color: var(--text-dim);
    opacity: 0.6;
    transition: opacity 0.3s, color 0.2s;
    z-index: 11;
    display: flex;
    align-items: center;
  }

  #toggle-btn:hover {
    opacity: 1;
    color: var(--text);
  }

  .icon-revealed, .icon-hidden {
    display: none;
  }

  :host([revealed]) .icon-revealed {
    display: block;
  }

  :host(:not([revealed])) .icon-hidden {
    display: block;
  }

  @media (max-width: 800px) {
    #toggle-btn {
      left: auto;
      right: 5px;
      top: 5px;
      background: var(--bg);
      border-radius: 50%;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
  }
</style>

<div id="container">
  <div id="content-wrapper" class="hidden">
    <slot></slot>
  </div>
  <div id="overlay">
    <span>click to reveal</span>
  </div>
  <button id="toggle-btn" aria-label="Toggle visibility" title="Toggle visibility">
    <svg class="icon-revealed" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
    <svg class="icon-hidden" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  </button>
</div>
`;

class BlogSuspense extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(suspenseTemplate.content.cloneNode(true));
    
    this._container = this.shadowRoot.getElementById('container');
    this._wrapper = this.shadowRoot.getElementById('content-wrapper');
    this._overlay = this.shadowRoot.getElementById('overlay');
    this._toggleBtn = this.shadowRoot.getElementById('toggle-btn');
  }

  connectedCallback() {
    this._overlay.addEventListener('click', () => this.reveal());
    this._toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg) {
      if (bg.startsWith('#')) {
        const r = parseInt(bg.slice(1, 3), 16);
        const g = parseInt(bg.slice(3, 5), 16);
        const b = parseInt(bg.slice(5, 7), 16);
        this._container.style.setProperty('--bg-rgb', `${r}, ${g}, ${b}`);
      }
    }
  }

  toggle() {
    if (this.hasAttribute('revealed')) {
      this.hide();
    } else {
      this.reveal();
    }
  }

  reveal() {
    this.setAttribute('revealed', '');
    this._wrapper.classList.remove('hidden');
  }

  hide() {
    this.removeAttribute('revealed');
    this._wrapper.classList.add('hidden');
  }
}

if (!customElements.get('site-suspense')) {
  customElements.define('site-suspense', BlogSuspense);
}
