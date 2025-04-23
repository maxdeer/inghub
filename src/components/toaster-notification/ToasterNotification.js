import { LitElement, html, css } from 'lit';

class ToasterNotification extends LitElement {
  static properties = {
    _message: { state: true },
    _type: { state: true }, 
    _visible: { state: true },
  };

  constructor() {
    super();
    this._message = '';
    this._type = 'success';
    this._visible = false;
    this._timer = null;
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      z-index: 2000;
      pointer-events: none; 
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      opacity: 0;
      transform: translateX(-50%) translateY(100%);
    }

    :host([visible]) {
      opacity: 1;
      transform: translateX(-50%) translateY(0); /* Centering and slide-in */
    }

    .toast {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.375rem; /* 6px */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); /* Shadow */
      font-size: 0.875rem; /* 14px */
      font-weight: 500;
      pointer-events: auto; /* Allow interaction with toast itself */
      max-width: 90vw;
      word-break: break-word;
    }

    .toast.success {
      background-color: #10b981; /* Emerald 500 */
      color: white;
    }

    .toast.error {
      background-color: #ef4444; /* Red 500 */
      color: white;
    }

    .icon {
      flex-shrink: 0;
      width: 1.25rem; /* 20px */
      height: 1.25rem;
    }

    .icon svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  show(message, type = 'success', duration = 3000) {
    clearTimeout(this._timer);

    this._message = message;
    this._type = type;
    this._visible = true;
    this.setAttribute('visible', '');

    this._timer = setTimeout(() => {
      this._visible = false;
      this.removeAttribute('visible');
    }, duration);
  }

  _renderIcon() {
    if (this._type === 'success') {
      return html`
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
    } else if (this._type === 'error') {
      return html`
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>`;
    }
    return '';
  }

  render() {
    if (!this._visible) {
      return html``;
    }

    return html`
      <div class="toast ${this._type}">
        <span class="icon">${this._renderIcon()}</span>
        <span>${this._message}</span>
      </div>
    `;
  }
}

customElements.define('toaster-notification', ToasterNotification); 