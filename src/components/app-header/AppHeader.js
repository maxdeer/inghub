import { LitElement, html, css } from 'lit';
import i18next from 'i18next';
import { buttonBaseStyles } from '../../shared-styles/button-styles.js';


class AppHeader extends LitElement {
  static properties = {
    _i18nReady: { state: true }, 
  };

  constructor() {
    super();
    this._i18nReady = i18next.isInitialized;
    this._onLanguageChanged = () => {
        this.requestUpdate(); 
    };
    this._onI18nInitialized = () => {
      this._i18nReady = true;
      this.requestUpdate(); 
    }; 
  }

  connectedCallback() {
    super.connectedCallback();
    i18next.on('languageChanged', this._onLanguageChanged);
    i18next.on('initialized', this._onI18nInitialized);
    if (i18next.isInitialized) {
        this._i18nReady = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18next.off('languageChanged', this._onLanguageChanged);
    i18next.off('initialized', this._onI18nInitialized);
  }


  static styles = [
    buttonBaseStyles,
    css`
    :host {
      --primary-color: #ff6600;
      --primary-light: #fff7ed;
      --primary-color-darker: #ea580c;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;  
      --red-600: #dc2626;
      --pagination-button-size: 2.25rem;
      --input-border-radius: 0.375rem;
      --input-padding-y: 0.5rem;
      --input-padding-x: 0.75rem;
      --gray-100: #f3f4f6;
   
      display: block;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      max-width: 1280px;
      margin: 0 auto;
    }
    .logo {
      font-weight: bold;
      color: var(--primary-color);
      font-size: 1.5rem;
    }
    nav {
        display: flex;
        align-items: center;
    }
    nav a {
      margin-left: 1rem;
      text-decoration: none;
      color: var(--gray-600);
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 0;
    }
    nav a.active {
        color: var(--primary-color);
        font-weight: 600;
    }

    nav .button-add-new {
      margin-left: 1rem;
      padding: 0.5rem 1rem;
    }
    nav .button-add-new svg {
         stroke: white;
    }

    .profile {
        display: flex;
        align-items: center;
        margin-left: 1rem;
    }
    .profile-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 9999px;
        background-color: #dc2626;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        font-size: 0.875rem;
    }
    nav a svg {
        width: 1rem;
        height: 1rem;
        margin-right: 0.25rem;
        stroke-width: 2;
        stroke: currentColor;
    }
    nav a.active svg {
        stroke: var(--primary-color);
    }

    .language-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 1.5rem;
    }
    .language-label {
        font-size: 0.875rem;
        color: var(--gray-600);
        margin-right: 0.25rem;
    }

    @media (max-width: 768px) {
        header {
            padding: 0.75rem 1rem;
        }
        nav a span,
        nav .button-add-new span {
        }
        nav a,
        nav .button-add-new {
             margin-left: 0.5rem;
        }
        .logo {
            font-size: 1.25rem;
        }
        .language-selector {
             margin-left: 0.75rem;
        }
    }
  `];

  // Very basic routing check for active state - Keep this logic
  _isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  // Navigation logic - Keep this logic
  _navigate(e, path) {
    e.preventDefault();
    if (path) {
      history.pushState({}, '', path);
      dispatchEvent(new PopStateEvent('popstate'));
      this.requestUpdate();
    }
  }

  _changeLanguage(lang) {
    if (!this._i18nReady) {
      return; 
    }

    i18next.changeLanguage(lang);
  }

  render() {
    const langLabelText = this._i18nReady ? i18next.t('appHeader.languageLabel') : 'Language';
    const employeesText = this._i18nReady ? i18next.t('appHeader.employees') : 'Employees';
    const addNewText = this._i18nReady ? i18next.t('appHeader.addNew') : 'Add New';

    return html`
      <header>
        <div class="logo">ING</div>
        <nav>
   
          <a href="/employees" class=${this._isActive('/employees') ? 'active' : ''} @click=${e => this._navigate(e, '/employees')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>${employeesText}</span> 
          </a>
          <button class="button button-primary button-add-new" @click=${e => this._navigate(e, '/employees/new')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            <span>${addNewText}</span> 
          </button>

        
          <div class="language-selector">
            <span class="language-label">${langLabelText}:</span> 
            <button 
              class="button-lang ${i18next.language === 'en' ? 'active' : ''}" 
              @click=${() => this._changeLanguage('en')} 
              aria-pressed=${i18next.language === 'en'}
              ?disabled=${!this._i18nReady}
            >
              EN
            </button>
            <button 
              class="button-lang ${i18next.language === 'tr' ? 'active' : ''}" 
              @click=${() => this._changeLanguage('tr')} 
              aria-pressed=${i18next.language === 'tr'}
              ?disabled=${!this._i18nReady}
            >
              TR
            </button>
          </div>
        </nav>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);
