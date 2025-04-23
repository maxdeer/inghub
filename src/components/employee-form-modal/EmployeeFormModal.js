import { LitElement, html, css } from 'lit';
import { store } from '../../store/index.js';
import { addEmployee, updateEmployee } from '../../store/employeeSlice.js';
import i18next from 'i18next';
import '../base-modal/BaseModal.js';
import '../toaster-notification/ToasterNotification.js'; 
import { buttonBaseStyles } from '../../shared-styles/button-styles.js';
import { formElementStyles } from '../../shared-styles/form-element-styles.js';

class EmployeeFormModal extends LitElement {
  static properties = {
    _employeeId: { state: true },
    _form: { state: true },
    _errorMessage: { state: true },
    _isOpen: { state: true },
    _title: { state: true },
  };

  constructor() {
    super();
    this._reset();
    this._boundHandleOpenEvent = this._handleOpenEvent.bind(this);
    this._onLanguageChanged = () => this.requestUpdate(); 
  }

  _reset() {
    this._employeeId = null;
    this._resetForm();
    this._errorMessage = '';
    this._isOpen = false;
    this._title = '';
  }

  _resetForm() {
     this._form = {
      id: null, 
      firstName: '',
      lastName: '',
      dateOfEmployment: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      department: '', 
      position: ''  
    };
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('[EmployeeFormModal] connectedCallback()');
    window.addEventListener('open-employee-form', this._boundHandleOpenEvent);
    i18next.on('languageChanged', this._onLanguageChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('open-employee-form', this._boundHandleOpenEvent);
    i18next.off('languageChanged', this._onLanguageChanged);
  }

  _handleOpenEvent(event) {
      const employeeId = event.detail?.employeeId;
      this.open(employeeId);
  }

  open(employeeId = null) {
    console.log('[EmployeeFormModal] open() called with ID:', employeeId);
    this._reset(); 
    if (employeeId) {
      const emp = store.getState().employees.find(e => e.id === employeeId);
      if (emp) {
        this._employeeId = employeeId;
        this._form = { ...emp }; 
        this._title = i18next.t('employeeForm.titleEdit'); 
      } else {
        this._title = i18next.t('employeeForm.titleAdd'); 
      }
    } else {
      this._title = i18next.t('employeeForm.titleAdd'); 
    }
    this._isOpen = true;
    this.requestUpdate(); 
  }

  close() {
    this._isOpen = false;
  }

  static styles = [
    buttonBaseStyles,
    formElementStyles,
    css`
    h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-800, #1f2937);
        margin-bottom: 1.5rem;
    }
    form {
       /* Remove max-width, margin, padding, bg, radius, shadow */
       /* These are handled by BaseModal's .dialog */
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjust minmax */
      gap: 1rem 1.5rem;
    }

    /* Responsive adjustments for form grid inside modal */
    /* BaseModal handles overall responsiveness */
    @media (max-width: 500px) { /* Example breakpoint */
        .form-grid {
             grid-template-columns: 1fr; /* Force single column earlier */
             gap: 0.75rem 1rem;
        }
    }
    `
  ];

  _onInput(e, field) {
    this._form = { ...this._form, [field]: e.target.value };
    if (this._errorMessage) {
        this._errorMessage = '';
    }
  }

  _submit(e) {
    console.log('[EmployeeFormModal] _submit() called');
    e.preventDefault();
    const formElement = this.shadowRoot.querySelector('form');

    const requiredFields = ['firstName', 'lastName', 'dateOfEmployment', 'dateOfBirth', 'phone', 'email', 'department', 'position'];
    let manualValidationPassed = true;
    requiredFields.forEach(field => {
        if (!this._form[field]) {
            manualValidationPassed = false;
            const inputEl = formElement.querySelector(`[name="${field}"]`);
            inputEl?.classList.add('input-invalid'); 
        }
    });

    
    if (!manualValidationPassed) {
         this._errorMessage = i18next.t('employeeForm.validation.requiredError'); 
       
         return;
    }
   
    const originalEmployee = this._employeeId ? store.getState().employees.find(emp => emp.id === this._employeeId) : null;
    const emailToCheck = this._form.email;
    if (emailToCheck && (!originalEmployee || originalEmployee.email.toLowerCase() !== emailToCheck.toLowerCase())) {
        const emailExists = store.getState().employees.some(emp =>
            emp.email.toLowerCase() === emailToCheck.toLowerCase() && emp.id !== this._employeeId
        );
        if (emailExists) {
            this._errorMessage = i18next.t('employeeForm.validation.emailInUseError'); 
            this.shadowRoot.querySelector('[name="email"]')?.focus();
            return;
        }
    }

    this._errorMessage = '';
    
    try {
      const formData = { ...this._form };
      const toaster = document.querySelector('toaster-notification');
      let message = '';
      const employeeName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();

      if (this._employeeId) {
          store.dispatch(updateEmployee(formData));
          message = i18next.t('toaster.updateSuccess', { name: employeeName }); 
          this.close(); 
          if (toaster) toaster.show(message, 'success');
      } else {
          store.dispatch(addEmployee(formData));
          message = i18next.t('toaster.addSuccess', { name: employeeName }); 
          this.close();
          if (toaster) toaster.show(message, 'success');
      }
    } catch (error) {
        this._errorMessage = i18next.t('employeeForm.validation.unexpectedError'); 
        const toaster = document.querySelector('toaster-notification');
        if (toaster) {
            toaster.show(this._errorMessage, 'error');
        }
    }
  }

  render() {
    // console.log('[EmployeeFormModal] render()');
    const cancelButtonText = i18next.t('employeeForm.button.cancel');
    const submitButtonText = this._employeeId ? i18next.t('employeeForm.button.update') : i18next.t('employeeForm.button.add');

    return html`
      <base-modal
        .isOpen=${this._isOpen}
        .title=${this._title}
        @modal-close=${this.close} 
      >
   
        <form id="employee-detail-form" @submit=${this._submit} novalidate>
            ${this._errorMessage ? html`<p class="error-message">${this._errorMessage}</p>` : ''} {* Error message is translated in _submit * }
            <div class="form-grid">
                {/* Pass translated labels to _field */}
                ${this._field(i18next.t('employeeForm.label.firstName'), 'firstName', 'text', true)}
                ${this._field(i18next.t('employeeForm.label.lastName'), 'lastName', 'text', true)}
                ${this._field(i18next.t('employeeForm.label.dateOfEmployment'), 'dateOfEmployment', 'date', true)}
                ${this._field(i18next.t('employeeForm.label.dateOfBirth'), 'dateOfBirth', 'date', true)}
                ${this._field(i18next.t('employeeForm.label.phone'), 'phone', 'tel', true)}
                ${this._field(i18next.t('employeeForm.label.email'), 'email', 'email', true)}
                ${this._field(i18next.t('employeeForm.label.department'), 'department', 'select', true, ['Analytics', 'Tech', 'HR', 'Marketing'])}
                ${this._field(i18next.t('employeeForm.label.position'), 'position', 'select', true, ['Junior', 'Medior', 'Senior', 'Manager'])}
            </div>
        </form>

        <div slot="footer" class="form-actions"> 
            <button type="button" class="button button-cancel" @click=${this.close}> {* Add base 'button' class * }
                {/* Assume icon is language-agnostic */}
                <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                <span>${cancelButtonText}</span>
            </button>
            <button type="submit" form="employee-detail-form" class="button button-primary"> {* Add base 'button' class, use primary * }
                 {/* Assume icon is language-agnostic */}
                 <svg class="button-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                 <span>${submitButtonText}</span>
            </button>
        </div>
      </base-modal>
    `;
  }

   _field(label, name, type = 'text', isRequired = false, options = null) {
    let inputElement;
    const currentValue = this._form ? this._form[name] : '';
    const placeholderText = i18next.t('employeeForm.label.selectPlaceholder', { field: label.replace('*' , '').trim() });

    if (type === 'select' && options) {
        inputElement = html`
            <select
                id=${name}
                name=${name}
                @change=${e => this._onInput(e, name)}
                .value=${currentValue || ''} 
                ?required=${isRequired}
            >
     
                <option value="" disabled ?selected=${!currentValue}>${placeholderText}</option>
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
                pattern=${type === 'tel' ? '\+?[0-9\s\-()]{7,}' : null} 
                max=${type === 'date' ? new Date().toISOString().split('T')[0] : null} 
                aria-describedby=${name + '-error'}
                aria-invalid=${this.shadowRoot?.querySelector(`#${name}`)?.checkValidity() === false}
            />`;
    }

    return html`
      <div class="field-group"> {* Use shared class * }
        {/* Label is already translated when passed */}
        <label for=${name}>${label}${isRequired ? '*' : ''}</label>
        ${inputElement}
        <div id=${name + '-error'} class="error-feedback" aria-live="polite"></div> {* Placeholder for specific field error, might need styling * }
      </div>
    `;
  }
}

customElements.define('employee-form-modal', EmployeeFormModal); 