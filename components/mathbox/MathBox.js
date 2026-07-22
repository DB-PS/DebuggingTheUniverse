const loadedScripts = {};

// Cache of already-rendered LaTeX strings to avoid calling tex2chtml each frame
const _latexCache = {};

function loadScript(src) {
  if (loadedScripts[src]) return loadedScripts[src];

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.hasAttribute('data-loaded')) {
        resolve();
      } else {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
      }
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      s.setAttribute('data-loaded', 'true');
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });

  loadedScripts[src] = promise;
  return promise;
}

const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: block;
    width: 100%;
    margin: 1.5rem 0;
    position: relative;
  }
  .graph-box {
    height: 400px;
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    background: var(--bg-soft);
    margin-left: auto;
    margin-right: auto;
  }
  #container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  #container .mathbox-label,
  #container mjx-container,
  #container span {
    text-shadow: none !important;
  }
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: var(--font-inter, "Inter", Helvetica);
    color: var(--text-dim);
    font-size: 0.9rem;
    z-index: 10;
  }
  ::slotted(script) {
    display: none;
  }
  .reset-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: var(--bg);
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: var(--font-inter, "Inter", Helvetica);
    cursor: pointer;
    z-index: 20;
    opacity: 0.7;
    transition: opacity 0.2s, color 0.2s;
  }
  .reset-btn:hover {
    opacity: 1;
    color: var(--text);
  }
  .caption {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-dim);
    margin-top: 0.5rem;
    font-family: "Inter", Helvetica, sans-serif;
    display: none;
  }
</style>
<!-- Inject MathBox CSS directly into shadow root for DOM overlays -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mathbox@latest/build/mathbox.css">
<div class="graph-box">
  <div class="loading">Loading MathBox...</div>
  <div id="container"></div>
</div>
<div class="caption" id="caption"></div>
<slot></slot>
`;

class BlogMathBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    try {
      // Load Three.js
      await loadScript('https://cdn.jsdelivr.net/npm/three@0.137.0/build/three.min.js');
      // Load OrbitControls (must match Three.js version)
      await loadScript('https://cdn.jsdelivr.net/npm/three@0.137.0/examples/js/controls/OrbitControls.js');
      // Load latest MathBox
      await loadScript('https://cdn.jsdelivr.net/npm/mathbox@latest/build/bundle/mathbox.js');
      
      this.initMathBox();
    } catch (e) {
      console.error('Failed to load MathBox dependencies', e);
      this.shadowRoot.querySelector('.loading').textContent = 'Failed to load MathBox.';
    }
  }

  initMathBox() {
    this.shadowRoot.querySelector('.loading').style.display = 'none';
    const container = this.shadowRoot.getElementById('container');
    const disableControls = this.hasAttribute('disable-controls');

    // Handle custom dimensions
    const graphBox = this.shadowRoot.querySelector('.graph-box');
    if (this.hasAttribute('height')) {
      graphBox.style.height = this.getAttribute('height');
    }
    if (this.hasAttribute('width')) {
      graphBox.style.width = this.getAttribute('width');
    }
    
    // Handle caption
    const captionEl = this.shadowRoot.getElementById('caption');
    if (this.hasAttribute('name')) {
      captionEl.textContent = this.getAttribute('name');
      captionEl.style.display = 'block';
    }

    const plugins = ['core', 'cursor'];
    const options = {
      element: container,
      plugins: plugins,
    };

    if (!disableControls) {
      plugins.push('controls');
      options.controls = {
        klass: window.THREE.OrbitControls
      };
    }

    // The modern MathBox bundle exports to window.MathBox
    const mathbox = window.MathBox.mathBox(options);

    // Register MathBox DOM type for LaTeX labels (uses MathJax tex2chtml).
    // Guarded so multiple <math-box> elements on the same page don't re-register.
    if (window.MathBox.DOM && !window.MathBox.DOM.Types.latex) {
      window.MathBox.DOM.Types.latex = window.MathBox.DOM.createClass({
        render: function(el) {
          var color    = this.props.color    || 'inherit';
          var fontSize = this.props.fontSize || '1em';
          delete this.props.color;
          delete this.props.fontSize;

          var tex = this.children;

          // MathJax not ready yet -- show raw tex; html expr re-runs each frame
          // so the rendered version appears as soon as MathJax finishes loading.
          if (!window.MathJax || !MathJax.tex2chtml) {
            this.props.innerHTML = '<span style="color:' + color + ';">' + tex + '</span>';
            return el('span', this.props);
          }

          // Render once then serve from cache
          if (!_latexCache[tex]) {
            var mathEl = MathJax.tex2chtml(tex);
            // Inject MathJax CHTML CSS into the document once
            if (!_latexCache.__cssInjected) {
              MathJax.startup.document.clear();
              MathJax.startup.document.updateDocument();
              _latexCache.__cssInjected = true;
            }
            _latexCache[tex] = mathEl.outerHTML;
          }

          this.props.innerHTML = '<span style="color:' + color + ';font-size:' + fontSize + ';">' + _latexCache[tex] + '</span>';
          return el('span', this.props);
        }
      });
    }

    // Add Reset View button if controls are enabled
    if (!disableControls) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-btn';
      resetBtn.textContent = 'Reset View';
      
      // We need to capture the initial camera state AFTER the user script runs
      let initialCamState = null;
      
      resetBtn.addEventListener('click', () => {
        if (initialCamState && mathbox.three.controls) {
          mathbox.three.controls.reset();
          // Force an immediate update
          mathbox.three.controls.update();
        }
      });
      
      this.shadowRoot.querySelector('.graph-box').appendChild(resetBtn);
      
      // Give the user script a tiny moment to run and set the camera, then save the state
      setTimeout(() => {
        if (mathbox.three.controls) {
          mathbox.three.controls.saveState();
          initialCamState = true;
        }
      }, 100);
    }

    // Theme integration for background
    const three = mathbox.three;
    const updateBg = () => {
      const bgHex = getComputedStyle(document.documentElement).getPropertyValue('--bg-soft').trim() || '#f4f4f4';
      three.renderer.setClearColor(new window.THREE.Color(bgHex), 1.0);
    };
    updateBg();
    
    // Listen for theme changes (simple observer on html data-theme)
    const observer = new MutationObserver(updateBg);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Execute user script
    const slot = this.shadowRoot.querySelector('slot');
    const scriptEls = slot.assignedElements().filter(el => el.tagName === 'SCRIPT' && el.type === 'text/mathbox');
    
    if (scriptEls.length > 0) {
      const scriptEl = scriptEls[0];
      let codePromise;
      
      if (scriptEl.hasAttribute('src')) {
        codePromise = fetch(scriptEl.getAttribute('src')).then(r => r.text());
      } else {
        codePromise = Promise.resolve(scriptEl.textContent);
      }
      
      codePromise.then(code => {
        try {
          const func = new Function('mathbox', 'THREE', code);
          func(mathbox, window.THREE);

          // Apply blog-specific default configuration to all text nodes
          mathbox.select('text').set({
            font: 'Helvetica',
            weight: 'normal',
            detail: 64
          });
        } catch (e) {
          console.error('Error executing MathBox script', e);
        }
      }).catch(e => {
        console.error('Failed to load MathBox script source', e);
      });
    }
  }
}

if (!customElements.get('math-box')) {
  customElements.define('math-box', BlogMathBox);
}
