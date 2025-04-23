import { LitElement, html, css } from 'lit';
import i18next from 'i18next'; // Import i18next
// Import shared styles
import { buttonBaseStyles } from '../../shared-styles/button-styles.js';
// Make sure hero-icon is loaded
// import '../path/to/hero-icon.js';

class DeleteConfirmDialog extends LitElement {
  static properties = {
    openState: { state: true },
    title: { type: String },
    message: { type: String }
  };

  constructor() {
    super();
    this.openState = false;
    this.title = '';
    this.message = '';
    // Bind the language change handler
    this._onLanguageChanged = () => this.requestUpdate(); 
  }

  connectedCallback() {
    super.connectedCallback();
    // Listen for language changes
    i18next.on('languageChanged', this._onLanguageChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Stop listening
    i18next.off('languageChanged', this._onLanguageChanged);
  }

  open() {
    this.openState = true;
  }

  close() {
    this.openState = false;
  }

  static styles = [
    buttonBaseStyles,
    css`
    .backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000; /* Ensure it's above other content */
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    }
    .backdrop.open {
      opacity: 1;
      visibility: visible;
    }
    .dialog {
      background-color: white;
      border-radius: 0.5rem; /* 8px */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Subtle shadow */
      padding: 0; /* Remove padding, handle inside */
      width: 100%;
      max-width: 28rem; /* 448px */
      position: relative;
      transform: scale(0.95);
      transition: transform 0.2s ease-in-out;
      display: flex; /* Use flex for layout */
      flex-direction: column;
    }
    .backdrop.open .dialog {
       transform: scale(1);
    }
    .dialog-body {
        padding: 1.5rem; /* Add padding back */
        display: flex;
        align-items: flex-start; /* Align icon top */
        gap: 1rem;
    }
    .dialog-icon {
        flex-shrink: 0;
        padding: 0.75rem; /* Padding around icon */
        background-color: var(--yellow-100); /* Light yellow bg */
        border-radius: 9999px; /* Circle */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.25rem; /* Align slightly below title */
    }
    .dialog-icon svg {
        width: 1.5rem; /* 24px */
        height: 1.5rem; /* 24px */
        color: var(--yellow-500); /* Yellow icon */
    }
    .dialog-content {
        flex-grow: 1;
    }
    .dialog-header {
      margin-bottom: 0.75rem; /* 12px - Reduced margin */
    }
    .dialog-title {
      font-size: 1.125rem; /* 18px */
      font-weight: 700; /* Bold */
      color: var(--gray-800); /* Use variable */
    }
    .close-button {
      background: none;
      border: none;
      padding: 0.25rem; /* 4px */
      cursor: pointer;
      color: var(--gray-500); /* Use variable */
      line-height: 1; /* Prevent icon stretching */
      position: absolute; /* Position it */
      top: 0.75rem;
      right: 0.75rem;
    }
    .close-button:hover {
      color: var(--gray-800); /* Use variable */
    }
    .close-button svg {
      width: 1.5rem; /* 24px */
      height: 1.5rem; /* 24px */
    }
    .dialog-message {
      font-size: 0.875rem; /* 14px */
      color: var(--gray-600); /* Use variable */
      margin-bottom: 0; /* Remove bottom margin as footer provides space */
      line-height: 1.5; /* Improve readability */
    }
    .dialog-actions {
      display: flex;
      flex-direction: row; /* Buttons side-by-side */
      justify-content: flex-end; /* Align buttons to the right */
      gap: 0.75rem; /* 12px space between buttons */
      background-color: var(--gray-100); /* Footer background */
      padding: 1rem 1.5rem; /* Footer padding */
      border-top: 1px solid var(--border-color, #e5e7eb); /* Use variable */
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }
    .button-proceed {
      background-color: var(--red-600); /* Destructive red */
      color: white;
      border-color: var(--red-600);
    }
    .button-proceed:hover {
      background-color: var(--red-700);
      border-color: var(--red-700);
    }
    .button-cancel {
      background-color: white;
      color: var(--gray-800); /* Darker text */
      border-color: #d1d5db; /* gray-300 border */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Subtle shadow */
    }
    .button-cancel:hover {
      background-color: var(--gray-100);
    }

    /* Responsive: Stack buttons on small screens if needed */
    @media (max-width: 400px) {
       .dialog-actions {
          flex-direction: column-reverse; /* Stack cancel below proceed */
          gap: 0.5rem; /* Reduce gap for stacked */
       }
       .dialog-actions button {
          width: 100%; /* Make buttons full width when stacked */
       }
    }
  `];

  render() {
    // Use class binding for open state to enable CSS transitions
    return html`
      <div class="backdrop ${this.openState ? 'open' : ''}" @click=${this.close}>
        <div class="dialog" @click=${(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-message" ?hidden=${!this.openState}>
          <div class="dialog-body">
              <div class="dialog-icon">
               
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                 </svg>
              </div>
              <div class="dialog-content">
                 <button class="close-button" @click=${this.close} aria-label="Close dialog">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div class="dialog-header">
                   <h2 id="dialog-title" class="dialog-title">${this.title}</h2>
                 </div>
                 <p id="dialog-message" class="dialog-message">${this.message}</p>
              </div>
          </div>
          <div class="dialog-actions">
             <button class="button button-cancel" @click=${() => this._confirm(false)}>
            
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
               <span>${i18next.t('deleteConfirmDialog.cancel')}</span>
             </button>
             <button class="button button-destructive" @click=${() => this._confirm(true)}>
          
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
               </svg>
               <span>${i18next.t('deleteConfirmDialog.proceed')}</span>
             </button>
           </div>
        </div>
      </div>
    `;
  }

  _confirm(ok) {
    if (ok) {
      this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }));
    }
    this.close();
  }
}

customElements.define('delete-confirm-dialog', DeleteConfirmDialog); 