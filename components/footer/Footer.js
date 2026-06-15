const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
<style>
  :host {
    display: block;
    margin-top: 3rem;
    padding-top: 0.75rem;
    font-size: 0.82rem;
    color: var(--text-dim);
    text-align: center;
    font-family: "Inter", Helvetica, sans-serif;
  }

  ::slotted(a) {
    color: var(--text-dim);
    text-decoration: none;
    transition: color 0.2s;
  }

  ::slotted(a:hover) {
    color: var(--text);
    text-decoration: underline;
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
</style>
<footer class="footer-content">
  <slot></slot>
  <theme-switcher></theme-switcher>
</footer>
`;

class BlogFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(footerTemplate.content.cloneNode(true));
  }
}

if (!customElements.get('site-footer')) {
  customElements.define('site-footer', BlogFooter);
}
