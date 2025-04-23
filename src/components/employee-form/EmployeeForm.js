import { LitElement, html, css } from 'lit';
import { store } from '../../store/index.js';
import { addEmployee, updateEmployee } from '../../store/employeeSlice.js';
import i18next from 'i18next'; 
import '../toaster-notification/ToasterNotification.js'; 
import { buttonBaseStyles } from '../../shared-styles/button-styles.js';
import { formElementStyles } from '../../shared-styles/form-element-styles.js';

class EmployeeForm extends LitElement {
  static properties = {
    employeeId: { type: String },
    form: { state: true },
    _errorMessage: { state: true },
  };

  constructor() {
    super();
    this.employeeId = null;
    this._resetForm();
    this._errorMessage = '';
    this._onLanguageChanged = () => this.requestUpdate(); 
  }

  _resetForm() {
    this.form = {
      firstName: '',
      lastName: '',
      dateOfEmployment: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      department: '',
      position: '',
    };
  }

  connectedCallback() {
    super.connectedCallback();
    i18next.on('languageChanged', this._onLanguageChanged);
    
    // Reset state initially
    this._resetForm();
    this._errorMessage = '';

    let employeeIdToLoad = this.employeeId; // Use property if already set (e.g., by test)

    // Fallback to URL check only if property isn't set
    if (!employeeIdToLoad) {
        const pathParts = window.location.pathname.split('/');
        const potentialId = pathParts[pathParts.length - 2];
        const isEdit = pathParts[pathParts.length - 1] === 'edit';
        employeeIdToLoad = isEdit ? potentialId : null;
        this.employeeId = employeeIdToLoad; // Set property based on URL if found
    }

    if (employeeIdToLoad) {
      const emp = store.getState().employees.find(e => e.id === employeeIdToLoad);
      if (emp) {
        // We already have the ID, just load the form data
        this.form = { ...this.form, ...emp }; 
      } else {
        // ID was set (either via property or URL) but not found in store
        this._errorMessage = "Employee not found."; // Set error message
        this._goBack(); // Go back
      }
    } 
    // If no employeeIdToLoad, it stays in add mode with reset form
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18next.off('languageChanged', this._onLanguageChanged);
  }

  _onInput(e, field) {
    this.form = { ...this.form, [field]: e.target.value };
    e.target.classList.remove('input-invalid');
    if (this._errorMessage) {
      this._errorMessage = '';
    }
  }

  _goBack(e) {
    e?.preventDefault();
    history.back();
  }

  _submit(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const formElement = this.shadowRoot.querySelector('form');

    Array.from(formElement.elements).forEach(el => el.classList.remove('input-invalid'));

    if (!formElement.checkValidity()) {
      Array.from(formElement.elements).forEach(el => {
          if (el.required && !el.checkValidity()) {
              el.classList.add('input-invalid');
          }
      });
      this._errorMessage = i18next.t('employeeForm.validation.requiredError'); 
      formElement.reportValidity();
      return;
    }

     const originalEmployee = this.employeeId ? store.getState().employees.find(emp => emp.id === this.employeeId) : null;
     const emailToCheck = this.form.email;
     if (emailToCheck && (!originalEmployee || originalEmployee.email.toLowerCase() !== emailToCheck.toLowerCase())) {
         const emailExists = store.getState().employees.some(emp =>
             emp.email.toLowerCase() === emailToCheck.toLowerCase() && emp.id !== this.employeeId
         );
         if (emailExists) {
             this._errorMessage = i18next.t('employeeForm.validation.emailInUseError'); 
             this.shadowRoot.querySelector('[name="email"]')?.focus();
             return;
         }
     }

    this._errorMessage = '';

    try {
      const employeeData = { ...this.form };
      const toaster = document.querySelector('toaster-notification');
      let message = '';
      const employeeName = `${employeeData.firstName || ''} ${employeeData.lastName || ''}`.trim();

      if (this.employeeId) {
   
         store.dispatch(updateEmployee(employeeData));
        
         message = i18next.t('toaster.updateSuccess', { name: employeeName }); 
         if (toaster) toaster.show(message, 'success');
         this._goBack();
      } else {
        
        store.dispatch(addEmployee(employeeData));
       
        message = i18next.t('toaster.addSuccess', { name: employeeName }); 
        if (toaster) toaster.show(message, 'success');
        this._goBack();
      }
    } catch (error) {
      this._errorMessage = i18next.t('employeeForm.validation.unexpectedError'); 
      const toaster = document.querySelector('toaster-notification');
      if (toaster) {
          toaster.show(this._errorMessage, 'error');
      }
    }
  }


  static styles = [
    buttonBaseStyles,
    formElementStyles,
    css`
    :host {
      --form-padding: 1.5rem;
      --field-vertical-gap: 1.75rem;
      --field-horizontal-gap: 5.5rem; /* User preference from before */
      /* Define CSS variables used locally if not global (or remove if global) */
      --input-padding-y: 0.625rem;
      --input-padding-x: 0.75rem;
      --input-border-radius: 0.375rem;
      --button-padding-y: 0.625rem;
      --button-padding-x: 1.5rem;
      --primary-color: #ff6600;
      --primary-color-darker: #ea580c;
      --gray-100: #f3f4f6;
      --gray-300: #d1d5db;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
      --red-600: #dc2626;

      display: block;
      padding: var(--form-padding);
      background-color: var(--background-color-light, #f9fafb); /* Use variable */
      font-family: var(--base-font-family, system-ui, -apple-system, sans-serif); /* Use variable */
    }

    .form-container {
      max-width: 48rem;
      margin: 1rem auto;
      padding: calc(var(--form-padding) * 1.5);
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-800);
      margin: 0 0 1.5rem 0;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb); /* Use variable */
    }

    form {
      display: flex;
      flex-wrap: wrap;
      gap: var(--field-vertical-gap) var(--field-horizontal-gap);
    }

  
    .field-pair {
      flex: 1 1 calc(50% - (var(--field-horizontal-gap) / 2)); /* Aim for 2 columns */
      min-width: 220px; /* Prevent excessive shrinking */
      box-sizing: border-box;
    
    }
    .form-actions {
       
        flex-basis: 100%;
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
        display: flex;
        justify-content: flex-end; 
        gap: 0.75rem;
    }
    @media (max-width: 640px) {
        :host {
            --form-padding: 1rem;
            /* Reduce gap slightly on mobile */
            --field-vertical-gap: 1.25rem;
        }
        .form-container {
            padding: 1.5rem;
        }
        form {
           /* Adjust gap for single column */
           gap: var(--field-vertical-gap) 0;
        }
        .field-pair {
           /* Items take full width */
           flex-basis: 100%;
           min-width: 0;
        }
        .form-actions {
            flex-direction: column-reverse;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }
        .form-actions button {
            width: 100%;
        }
        /* Adjust error message positioning relative to reduced gap */
        .error-message {
             margin-top: calc(var(--field-vertical-gap) * -0.25);
        }
    }
  `];



  render() {
    const title = this.employeeId 
                    ? i18next.t('employeeForm.titleEdit') 
                    : i18next.t('employeeForm.titleAdd');
    
    const cancelButtonText = i18next.t('employeeForm.button.cancel');
    const submitButtonText = this.employeeId 
                             ? i18next.t('employeeForm.button.update') 
                             : i18next.t('employeeForm.button.add');

    return html`
      <div class="form-container">
        <h2>${title}</h2>
        ${this._errorMessage ? html`<p class="error-message">${this._errorMessage}</p>` : ''}
        <form @submit=${this._submit} novalidate>
          ${this._field(i18next.t('employeeForm.label.firstName'), 'firstName', 'text', true)}
          ${this._field(i18next.t('employeeForm.label.lastName'), 'lastName', 'text', true)}
          ${this._field(i18next.t('employeeForm.label.dateOfEmployment'), 'dateOfEmployment', 'date', true)}
          ${this._field(i18next.t('employeeForm.label.dateOfBirth'), 'dateOfBirth', 'date', true)}
          ${this._field(i18next.t('employeeForm.label.phone'), 'phone', 'tel', true)}
          ${this._field(i18next.t('employeeForm.label.email'), 'email', 'email', true)}
          ${this._field(i18next.t('employeeForm.label.department'), 'department', 'select', true, ['Analytics', 'Tech', 'HR', 'Marketing'])}
          ${this._field(i18next.t('employeeForm.label.position'), 'position', 'select', true, ['Junior', 'Medior', 'Senior', 'Manager'])}

          <div class="form-actions">
            <button type="button" class="button button-cancel" @click=${this._goBack}>
              <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
              <span>${cancelButtonText}</span>
            </button>
            <button type="submit" class="button button-primary">
              <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>
              <span>${submitButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }


  _field(label, name, type = 'text', isRequired = false, options = null) {
    let inputElement;
    const placeholder = type === 'date' ? "dd . mm . yyyy" : undefined;
    const currentValue = this.form ? this.form[name] : '';
    const selectPlaceholder = i18next.t('employeeForm.label.selectPlaceholder', { field: label.replace('*' , '').trim() });

    if (type === 'select' && options) {
      inputElement = html`
        <select
          id=${name}
          name=${name}
          @change=${e => this._onInput(e, name)}
          .value=${currentValue || ''}
          ?required=${isRequired}
        >
          <option value="" disabled ?selected=${!currentValue}>${selectPlaceholder}</option>
          ${options.map(opt => html`<option value=${opt} ?selected=${currentValue === opt}>${opt}</option>`)}
        </select>`;
    } else {
      inputElement = html`
        <input
          id=${name}
          name=${name}
          type=${type}
          .value=${currentValue}
          @input=${e => this._onInput(e, name)}
          ?required=${isRequired}
          placeholder=${placeholder}
        />`;
    }

    return html`
      <div class="field-pair">
        <label for=${name}>${label}${isRequired ? '*' : ''}</label>
        ${inputElement}

      </div>
    `;
  }
}

customElements.define('employee-form', EmployeeForm); 