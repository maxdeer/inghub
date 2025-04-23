import { LitElement, html, css } from 'lit';


class BaseModal extends LitElement {
  static properties = {
    isOpen: { type: Boolean, reflect: true },
    title: { type: String },
  };

  constructor() {
    super();
    this.isOpen = false;
    this.title = '';
    this._boundHandleKeydown = this._handleKeydown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.isOpen) {
       window.addEventListener('keydown', this._boundHandleKeydown);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this._boundHandleKeydown);
  }

  updated(changedProperties) {
     if (changedProperties.has('isOpen')) {
       if (this.isOpen) {
         window.addEventListener('keydown', this._boundHandleKeydown);
       } else {
         window.removeEventListener('keydown', this._boundHandleKeydown);
       }
     }
  }

  _handleKeydown(event) {
     if (event.key === 'Escape') {
       this.close();
     }
  }

  open() {
    this.isOpen = true;
    this.dispatchEvent(new CustomEvent('modal-open', { bubbles: true, composed: true }));
  }

  close() {
    this.isOpen = false;
    this.dispatchEvent(new CustomEvent('modal-close', { bubbles: true, composed: true }));
  }

  static styles = css`
    :host {
       display: none;
    }
    :host([isOpen]) {
       display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.3); 
      backdrop-filter: blur(4px); 
      -webkit-backdrop-filter: blur(4px); 
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      padding: 1rem;
    }

    :host([isOpen]) .backdrop {
      opacity: 1;
      visibility: visible;
    }

    .dialog {
      background-color: white;
      border-radius: 0.5rem; /* 8px */
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); /* Tailwind shadow-lg */
      width: 100%;
      max-width: 32rem; 
      max-height: 90vh; 
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    :host([isOpen]) .dialog {
       opacity: 1;
       transform: scale(1);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem; 
      border-bottom: 1px solid #e5e7eb; 
      flex-shrink: 0; 
    }

    .dialog-title {
      font-size: 1.125rem; /* 18px */
      font-weight: 600; /* Semibold */
      color: #1f2937; /* gray-800 */
    }

    .close-button {
      background: none;
      border: none;
      padding: 0.25rem;
      margin-left: 1rem;
      cursor: pointer;
      color: #6b7280;
      line-height: 1;
    }
    .close-button:hover {
      color: #1f2937; 
    }
    .close-button hero-icon {
      width: 1.5rem;
      height: 1.5rem;
    }

    .dialog-content {
      padding: 1.5rem; 
      overflow-y: auto;
      flex-grow: 1;
    }

    .dialog-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb; 
      background-color: #f9fafb; 
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-shrink: 0; 
    }
  `;

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="backdrop" @click=${this.close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="dialog-title">

          ${this.title ? html`
            <div class="dialog-header">
              <h2 id="dialog-title" class="dialog-title">${this.title}</h2>
              <button class="close-button" @click=${this.close} aria-label="Close dialog">
                <hero-icon name="x-mark" type="outline"></hero-icon>
              </button>
            </div>
          ` : html`
             <button class="close-button" style="position: absolute; top: 0.5rem; right: 0.5rem; z-index: 1;" @click=${this.close} aria-label="Close dialog">
                <hero-icon name="x-mark" type="outline"></hero-icon>
              </button>
          `}

          <div class="dialog-content">
            <slot></slot> <!-- Default slot for main content -->
          </div>

          <div class="dialog-footer">
            <slot name="footer"></slot> <!-- Slot for action buttons -->
          </div>

        </div>
      </div>
    `;
  }
}

customElements.define('base-modal', BaseModal); 