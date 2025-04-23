import { LitElement, html, css } from 'lit';
import { store } from '../../store/index.js';
import { deleteEmployee, addEmployee } from '../../store/employeeSlice.js';
import i18next from 'i18next';
import '../modal-confirm/DeleteConfirmDialog.js';
import '../toaster-notification/ToasterNotification.js';
import { buttonBaseStyles } from '../../shared-styles/button-styles.js';
import { formElementStyles } from '../../shared-styles/form-element-styles.js';

class EmployeeList extends LitElement {
  static properties = {
    view: { type: String },
    employees: { type: Array },
    _confirmEmployee: { state: true },
    _currentPage: { state: true },
    _itemsPerPage: { state: true },
    _searchTerm: { state: true },
    _selectedEmployees: { state: true },
  };

  constructor() {
    super();
    this.view = 'table';
    this.employees = store.getState().employees;
    this._confirmEmployee = null;
    this._currentPage = 1;
    this._itemsPerPage = 10;
    this._searchTerm = '';
    this._selectedEmployees = new Set();
    this._onLanguageChanged = () => this.requestUpdate();

    store.subscribe(() => {
      const newState = store.getState().employees;
      if (JSON.stringify(this.employees) !== JSON.stringify(newState)) {
        this.employees = [...newState];
        this.requestUpdate();
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    i18next.on('languageChanged', this._onLanguageChanged);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    i18next.off('languageChanged', this._onLanguageChanged);
  }

  get filteredEmployees() {
    const term = this._searchTerm.toLowerCase().trim();
    if (!term) {
      return this.employees;
    }
    const filtered = this.employees.filter(emp => {
      return (
        emp.firstName?.toLowerCase().includes(term) ||
        emp.lastName?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term) ||
        emp.position?.toLowerCase().includes(term)
      );
    });
    return filtered;
  }

  get paginatedEmployees() {
    const startIndex = (this._currentPage - 1) * this._itemsPerPage;
    const endIndex = startIndex + this._itemsPerPage;
    return this.filteredEmployees.slice(startIndex, endIndex);
  }

  static styles = [
    buttonBaseStyles,
    formElementStyles,
    css`
    :host {
      /* Define CSS variables - assume these are global or defined elsewhere if needed */
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

      display: block;
      padding: 1.5rem;
      background-color: var(--background-color-light, #f9fafb);
      font-family: var(--base-font-family, system-ui, -apple-system, sans-serif);
    }
    .list-container {
      background-color: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    .list-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }
    .list-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--gray-800);
      flex-shrink: 1;
      margin-right: 1rem;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-grow: 1;
      justify-content: flex-end;
    }
    .search-control {
      display: flex;
      align-items: center;
    }
    .search-control input[type="search"] {
      min-width: 200px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
      flex-grow: 1;
    }
    .search-button {
      padding: 0 0.75rem;
      height: calc(1.5em + var(--input-padding-y, 0.5rem) * 2 + 2px);
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--gray-300, #d1d5db);
      border-left: none;
      background-color: white;
      color: var(--gray-600);
      border-top-right-radius: var(--input-border-radius, 0.375rem);
      border-bottom-right-radius: var(--input-border-radius, 0.375rem);
      cursor: pointer;
      transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
      flex-shrink: 0;
    }
    .search-button svg {
      width: 1rem;
      height: 1rem;
      stroke-width: 2;
    }
    .search-button:hover {
      background-color: var(--gray-50, #f9fafb);
      color: var(--gray-800);
    }
    .search-button:focus-visible {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
      z-index: 1;
    }
    .view-toggle button {
      background: none;
      border: 1px solid var(--gray-200);
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      color: var(--gray-500);
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      box-sizing: border-box;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .view-toggle button:first-child {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
      z-index: 1;
      border-width: 1px;
    }
    .view-toggle button:last-child {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .view-toggle button.active {
      background-color: var(--primary-light, #fff7ed);
      border-color: var(--primary-color);
      color: var(--primary-color);
      z-index: 1;
    }
    .view-toggle button:focus-visible {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
      z-index: 2;
    }
    .view-toggle svg {
      width: 1.25rem;
      height: 1.25rem;
      display: block;
      stroke-width: 1.5;
    }

    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
      min-width: 900px;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--gray-200);
      white-space: nowrap;
      vertical-align: middle;
    }
    th {
      color: var(--primary-color);
      font-weight: 600;
      background-color: white;
      border-bottom-width: 2px;
      border-color: var(--gray-200);
    }
    th:first-child, td:first-child {
      width: 3rem;
      padding-left: 1rem;
      padding-right: 0.5rem;
      text-align: center;
    }
    th:last-child, td:last-child {
      width: 6rem;
      text-align: center;
      padding-right: 1rem;
    }
    td { color: var(--gray-700); }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover { background-color: var(--gray-50, #f9fafb); }

    input[type="checkbox"] {
      border-radius: 0.25rem;
      border-color: var(--gray-300);
      color: var(--primary-color);
      cursor: pointer;
      width: 1rem;
      height: 1rem;
      vertical-align: middle;
      accent-color: var(--primary-color);
    }
    input[type="checkbox"]:focus {
      outline: none;
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
    }

    .action-buttons {
      white-space: nowrap;
    }

    .list-view-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .list-view-item {
      background-color: white;
      padding: 1rem;
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 0.875rem;
    }
    .list-view-item .info p { margin: 0 0 0.25rem; color: var(--gray-600); }
    .list-view-item .info .name { font-weight: 600; color: var(--gray-800); font-size: 1rem; }
    .list-view-item .info .position-dept { font-size: 0.75rem; color: var(--gray-500); margin-bottom: 0.75rem; }
    .list-view-item .actions {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
    }

    .pagination {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--gray-200);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.875rem;
      gap: 0.5rem;
    }
    .pagination .page-numbers {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .pagination button,
    .pagination span {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: var(--pagination-button-size);
      height: var(--pagination-button-size);
      padding: 0 0.5rem;
      border: 1px solid transparent;
      border-radius: 9999px;
      background-color: transparent;
      color: var(--gray-500);
      cursor: pointer;
      text-align: center;
      line-height: 1;
      font-weight: 500;
      transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    .pagination button:hover:not(:disabled),
    .pagination span:not(.dots):not(.active):hover {
      background-color: var(--gray-100);
      color: var(--gray-700);
    }
    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .pagination span.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      font-weight: 600;
      cursor: default;
    }
    .pagination span.dots {
      background: none;
      border: none;
      cursor: default;
      color: var(--gray-400);
      width: auto;
      min-width: auto;
      padding: 0 0.25rem;
    }
    .pagination button:focus-visible,
    .pagination span:not(.dots):focus-visible {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
      z-index: 1;
    }
    .pagination svg {
      width: 1.125rem;
      height: 1.125rem;
      stroke-width: 2;
      display: block;
    }

    .results-count {
      font-size: 0.875rem;
      color: var(--gray-600);
      margin-top: 1.5rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      :host { padding: 1rem; }
      .list-container { padding: 1rem; }
      .list-header {
        flex-direction: column;
        align-items: stretch;
      }
      .list-title { margin-bottom: 0.75rem; margin-right: 0; }
      .controls {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
      .search-control {
        order: 1;
      }
      .search-control input { min-width: 150px; }

      .view-toggle {
        order: 2;
        align-self: flex-end;
      }

      th, td { padding: 0.5rem 0.75rem; }
      th:first-child, td:first-child { padding-left: 0.75rem; padding-right: 0.25rem; }
      th:last-child, td:last-child { padding-right: 0.75rem; }
    }
    @media (max-width: 640px) {
      .pagination {
        padding-top: 1rem;
        margin-top: 1rem;
        flex-direction: column;
      }
      .pagination .page-numbers {
        order: 1;
        margin-bottom: 0.5rem;
      }
      .pagination button:first-child { order: 2; }
      .pagination button:last-child { order: 3; }
      .results-count {
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
    }

    @media (max-width: 900px) {
      .hide-sm {
        display: none;
      }
    }

    .empty-state-container {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--gray-500);
    }
    .empty-state-container p {
      margin-bottom: 1rem;
    }
    .empty-state-container .button {
      /* Inherits base button styles */
      margin-top: 0.5rem; /* Add some space above the button */
    }
    /* Define button-secondary if not globally defined */
    .button.button-secondary {
      background-color: var(--gray-100);
      color: var(--gray-700);
      border-color: var(--gray-300);
    }
    .button.button-secondary:hover {
      background-color: var(--gray-200);
      border-color: var(--gray-400);
    }
    .button.button-secondary:focus-visible {
       outline: none;
       border-color: var(--primary-color);
       box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(255, 102, 0, 0.5);
    }

    /* Style for selected table rows */
    tr.selected-row {
      background-color: var(--gray-100, #f3f4f6); /* Use a light gray background */
    }
    tr.selected-row:hover {
      background-color: var(--gray-200, #e5e7eb); /* Slightly darker on hover */
    }

    /* Style for selected count info */
    .selected-count-info {
      margin-top: 1rem; 
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      color: var(--gray-600, #4b5563);
      background-color: var(--primary-light, #fff7ed);
      border: 1px solid var(--primary-color, #ff6600);
      border-radius: 0.375rem;
      text-align: center;
    }
  `];

  _setView(v) { this.view = v; }
  _fullName(employee) { return `${employee.firstName || ''} ${employee.lastName || ''}`.trim(); }
  _openConfirm(employee) { this._confirmEmployee = employee; this.shadowRoot.querySelector('delete-confirm-dialog').open(); }
  _delete() { 
    if (this._confirmEmployee) { 
      const employeeName = this._fullName(this._confirmEmployee);
      const employeeId = this._confirmEmployee.id;
      store.dispatch(deleteEmployee(employeeId)); 
      this._confirmEmployee = null; 
      const toaster = document.querySelector('toaster-notification');
      if (toaster) {
        toaster.show(i18next.t('toaster.deleteSuccess', { name: employeeName }), 'success');
      } else {
        console.warn('Toaster notification component not found.');
      }
    } 
  }
  _nav(event) { event.preventDefault(); const href = event.currentTarget.getAttribute('href'); window.history.pushState({}, '', href); window.dispatchEvent(new PopStateEvent('popstate')); }

  _goToPage(page) {
    const totalPages = Math.ceil(this.filteredEmployees.length / this._itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this._currentPage = page;
    }
  }

  _updateSearchTerm(e) {
    this._searchTerm = e.target.value;
  }

  _triggerSearch(e) {
    if (e && e.key === 'Enter') {
      e.preventDefault();
    }
    this._currentPage = 1;
    this.requestUpdate();
  }

  _generateAndAddEmployee() {
    const firstNames = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Murat', 'Yusuf', 'Ömer', 'Eren', 'Can', 'Kerem', 'Emir', 'Berkay', 'Deniz', 'Arda', 'Burak', 'İsmail', 'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şerife', 'Zehra', 'Sultan', 'Hanife', 'Gülsüm', 'Yasemin', 'Rabia', 'Ebru', 'Derya', 'Büşra', 'Gamze', 'Gizem', 'Melek'];
    const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özcan', 'Şen', 'Aksoy', 'Polat', 'Güler', 'Tekin', 'Taş', 'Bulut', 'Korkmaz', 'Aslan', 'Sarı', 'Çalışkan'];
    const departments = ['Analytics', 'Tech', 'HR', 'Marketing'];
    const positions = ['Junior', 'Medior', 'Senior', 'Manager'];


    for (let i = 0; i < 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      

      const sanitize = (name) => name
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/[ıi̇]/g, 'i') 
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');

      const sanitizedFirstName = sanitize(firstName);
      const sanitizedLastName = sanitize(lastName);

      const email = `${sanitizedFirstName}.${sanitizedLastName}${Math.floor(Math.random() * 100)}@example.com`;
      
      const birthYear = 1960 + Math.floor(Math.random() * 40); 
      const birthMonth = Math.floor(Math.random() * 12) + 1;
      const birthDay = Math.floor(Math.random() * 28) + 1; 
      const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

      const employmentYear = Math.max(birthYear + 18, 2000 + Math.floor(Math.random() * 24)); // Employed after 18 and between 2000-2023
      const employmentMonth = Math.floor(Math.random() * 12) + 1;
      const employmentDay = Math.floor(Math.random() * 28) + 1;
      const dateOfEmployment = `${employmentYear}-${String(employmentMonth).padStart(2, '0')}-${String(employmentDay).padStart(2, '0')}`;

      const phone = `5${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 90)}`;

      const newEmployee = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        department: departments[Math.floor(Math.random() * departments.length)],
        position: positions[Math.floor(Math.random() * positions.length)],
        dateOfEmployment: dateOfEmployment,
        dateOfBirth: dateOfBirth,
      };
      store.dispatch(addEmployee(newEmployee)); 
    }
  }

  _handleSelectRow(employeeId) {
    const newSelection = new Set(this._selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    this._selectedEmployees = newSelection;
  }

  _handleSelectAll(event, employeesOnPage) {
    const isChecked = event.target.checked;
    const newSelection = new Set(this._selectedEmployees);
    
    employeesOnPage.forEach(emp => {
      if (isChecked) {
        newSelection.add(emp.id);
      } else {
        newSelection.delete(emp.id);
      }
    });
    this._selectedEmployees = newSelection;
  }

  render() {
    const filtered = this.filteredEmployees;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this._itemsPerPage);
    const startIndex = (this._currentPage - 1) * this._itemsPerPage;
    const endIndex = Math.min(startIndex + this._itemsPerPage, totalItems);
    const employeesToDisplay = filtered.slice(startIndex, endIndex);

    const confirmDialogTitle = this._confirmEmployee ? i18next.t('deleteConfirmDialog.title') : '';
    const confirmDialogMessage = this._confirmEmployee ? i18next.t('deleteConfirmDialog.message', { name: this._fullName(this._confirmEmployee) }) : '';

    return html`
      <div class="list-container">
        <div class="list-header">
          <h2 class="list-title">${i18next.t('employeeList.title')}</h2>
          <div class="controls">
            <div class="search-control">
              <input
                type="search"
                placeholder="${i18next.t('employeeList.searchPlaceholder')}"
                .value=${this._searchTerm}
                @input=${this._updateSearchTerm}
                @keydown=${(e) => e.key === 'Enter' && this._triggerSearch(e)}
                aria-label="${i18next.t('employeeList.searchAriaLabel')}"
              />
              <button class="search-button" @click=${this._triggerSearch} aria-label="${i18next.t('employeeList.searchBtn')}" title="${i18next.t('employeeList.searchBtn')}">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            <div class="view-toggle">
              <button
                class=${this.view === 'list' ? 'active' : ''}
                @click=${() => this._setView('list')}
                aria-label="${i18next.t('employeeList.listViewBtn')}"
                title="${i18next.t('employeeList.listViewBtn')}"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
              </button>
              <button
                class=${this.view === 'table' ? 'active' : ''}
                @click=${() => this._setView('table')}
                aria-label="${i18next.t('employeeList.tableViewBtn')}"
                title="${i18next.t('employeeList.tableViewBtn')}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>

        ${filtered.length === 0
          ? html`<div class="empty-state-container">
                  <p>
                    ${this._searchTerm
                      ? i18next.t('employeeList.empty.noResultsForTerm', { term: this._searchTerm })
                      : i18next.t('employeeList.empty.noResults')}
                  </p>
                  ${!this._searchTerm ? html`
                    <button 
                      class="button button-secondary" 
                      @click=${this._generateAndAddEmployee}
                    >
                      ${i18next.t('employeeList.generateEmployeeBtn', 'Generate Employee')}
                    </button>
                  ` : ''}
                </div>`
          : (this.view === 'table' ? this._renderTable(employeesToDisplay) : this._renderList(employeesToDisplay))
        }

        ${this._selectedEmployees.size > 0 ? html`
          <div class="selected-count-info">
            ${i18next.t('employeeList.selectedCount', { count: this._selectedEmployees.size })}
          </div>
        ` : ''}

        ${totalItems > 0 ? html`
          <div class="results-count" aria-live="polite">
            ${i18next.t('employeeList.pagination.resultsCount', { start: startIndex + 1, end: endIndex, total: totalItems })}
          </div>
        ` : ''}

        ${totalItems > 0 && totalPages > 1 ? this._renderPagination() : ''}

      </div>

      <delete-confirm-dialog
        .title="${confirmDialogTitle}"
        .message=${confirmDialogMessage}
        @confirm=${this._delete}
      ></delete-confirm-dialog>
    `;
  }

  _renderTable(employees) {
    const numOnPage = employees.length;
    const numSelectedOnPage = employees.filter(e => this._selectedEmployees.has(e.id)).length;
    const allOnPageSelected = numOnPage > 0 && numSelectedOnPage === numOnPage;
    const someOnPageSelected = numSelectedOnPage > 0 && numSelectedOnPage < numOnPage;

    return html`
      <div class="table-container">
        <table class="min-w-full">
          <thead>
            <tr>
              <th scope="col">
                <input 
                  type="checkbox" 
                  aria-label="${i18next.t('employeeList.table.selectAllAria')}"
                  .checked=${allOnPageSelected}
                  .indeterminate=${someOnPageSelected}
                  @change=${(e) => this._handleSelectAll(e, employees)}
                >
              </th>
              <th scope="col">${i18next.t('employeeList.table.firstName')}</th>
              <th scope="col">${i18next.t('employeeList.table.lastName')}</th>
              <th scope="col" class="hide-sm">${i18next.t('employeeList.table.dateOfEmployment')}</th>
              <th scope="col" class="hide-sm">${i18next.t('employeeList.table.dateOfBirth')}</th>
              <th scope="col">${i18next.t('employeeList.table.phone')}</th>
              <th scope="col">${i18next.t('employeeList.table.email')}</th>
              <th scope="col">${i18next.t('employeeList.table.department')}</th>
              <th scope="col">${i18next.t('employeeList.table.position')}</th>
              <th scope="col">${i18next.t('employeeList.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map(
              (e) => {
                const isSelected = this._selectedEmployees.has(e.id);
                return html`
                  <tr class=${isSelected ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        aria-label="${i18next.t('employeeList.table.selectOneAria', { name: this._fullName(e) })}"
                        .checked=${isSelected}
                        @change=${() => this._handleSelectRow(e.id)}
                      >
                    </td>
                    <td>${e.firstName}</td>
                    <td>${e.lastName}</td>
                    <td class="hide-sm">${e.dateOfEmployment}</td>
                    <td class="hide-sm">${e.dateOfBirth}</td>
                    <td>${e.phone}</td>
                    <td>${e.email}</td>
                    <td>${e.department}</td>
                    <td>${e.position}</td>
                    <td class="action-buttons">
                      <a href="/employees/${e.id}/edit" class="button-action" @click=${this._nav} title="${i18next.t('employeeList.table.editAction')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>
                      </a>
                      <button class="button-action" @click=${() => this._openConfirm(e)} title="${i18next.t('employeeList.table.deleteAction')}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                      </button>
                    </td>
                  </tr>
                `;
              }
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  _renderList(employees) {
    return html`
      <div class="list-view-grid">
        ${employees.map(
          (e) => html`
            <div class="list-view-item">
              <div class="info">
                <p class="name">${this._fullName(e)}</p>
                <p class="position-dept">${e.position} – ${e.department}</p>
                <p>${i18next.t('employeeList.list.employed')}: ${e.dateOfEmployment}</p>
                <p>${i18next.t('employeeList.list.born')}: ${e.dateOfBirth}</p>
                <p>✉️ ${e.email}</p>
                <p>📞 ${e.phone}</p>
              </div>
              <div class="actions action-buttons">
                 <a href="/employees/${e.id}/edit" class="button-action" @click=${this._nav} title="${i18next.t('employeeList.table.editAction')}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /></svg>
                  </a>
                  <button class="button-action" @click=${() => this._openConfirm(e)} title="${i18next.t('employeeList.table.deleteAction')}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                  </button>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  _renderPagination() {
    const totalItems = this.filteredEmployees.length;
    const totalPages = Math.ceil(totalItems / this._itemsPerPage);
    if (totalPages <= 1) return '';

    const pages = [];
    const maxPagesToShow = 5;
    const pageSpread = 2;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow + 2) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (this._currentPage <= pageSpread + 1) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (this._currentPage >= totalPages - pageSpread) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = this._currentPage - pageSpread;
        endPage = this._currentPage + pageSpread;
      }
    }

    if (startPage > 1) {
      pages.push(html`<span role="button" tabindex="0" @click=${() => this._goToPage(1)} @keydown=${(e) => e.key === 'Enter' && this._goToPage(1)} aria-label="${i18next.t('employeeList.pagination.goToPage', { page: 1 })}">1</span>`);
      if (startPage > 2) {
        pages.push(html`<span class="dots">...</span>`);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(html`
        <span
          class="${i === this._currentPage ? 'active' : ''}"
          role="button"
          tabindex="0"
          @click=${() => this._goToPage(i)}
          @keydown=${(e) => e.key === 'Enter' && this._goToPage(i)}
          aria-current=${i === this._currentPage ? 'page' : 'false'}
          aria-label="${i18next.t('employeeList.pagination.goToPage', { page: i })}"
        >
          ${i}
        </span>`);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(html`<span class="dots">...</span>`);
      }
      pages.push(html`<span role="button" tabindex="0" @click=${() => this._goToPage(totalPages)} @keydown=${(e) => e.key === 'Enter' && this._goToPage(totalPages)} aria-label="${i18next.t('employeeList.pagination.goToPage', { page: totalPages })}">${totalPages}</span>`);
    }

    return html`
      <nav class="pagination" aria-label="Pagination">
        <button
          @click=${() => this._goToPage(this._currentPage - 1)}
          ?disabled=${this._currentPage === 1}
          aria-label="${i18next.t('employeeList.pagination.previous')}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
        </button>
        <div class="page-numbers">
            ${pages}
        </div>
        <button
          @click=${() => this._goToPage(this._currentPage + 1)}
          ?disabled=${this._currentPage === totalPages}
          aria-label="${i18next.t('employeeList.pagination.next')}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
        </button>
      </nav>
    `;
  }
}

customElements.define('employee-list', EmployeeList); 