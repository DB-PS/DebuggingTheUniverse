const siteRefTemplate = document.createElement('template');
siteRefTemplate.innerHTML = `
<style>
  :host {
    display: block;
    margin: 3rem 0 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  .ref-heading {
    font-family: var(--font-inter, "Inter", Helvetica);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin: 0 0 1rem;
  }

  .ref-list {
    margin: 0;
    padding-left: 1.4rem;
    font-family: var(--font-source-serif, "Source Serif 4", serif);
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--text-dim);
  }

  ::slotted(li) {
    margin-bottom: 0.6rem;
    padding-left: 0.3rem;
  }

  ::slotted(a) {
    color: var(--link);
  }

  ::slotted(code) {
    background: var(--bg-soft);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9em;
  }
</style>
<div class="ref-heading"></div>
<ol class="ref-list">
  <slot></slot>
</ol>
`;

class SiteRef extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(siteRefTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    const heading = this.shadowRoot.querySelector('.ref-heading');
    heading.textContent = this.getAttribute('title') || 'References';
  }
}

if (!customElements.get('site-ref')) {
  customElements.define('site-ref', SiteRef);
}
