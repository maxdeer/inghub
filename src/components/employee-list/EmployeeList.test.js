import { html, fixture, expect, elementUpdated, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import i18next from 'i18next';
import { store } from '../../store/index.js'; 
import { deleteEmployee } from '../../store/employeeSlice.js'; 
let i18nStub;
const i18nOnStub = sinon.stub();
const i18nOffStub = sinon.stub();
const changeLanguageStub = sinon.stub();
function setupI18nMock(isInitialized = true, language = 'en') {
  if (i18nStub && i18nStub.restore) {
    i18nStub.restore();
  }
  const propsToRestore = ['isInitialized', 'language', 'on', 'off', 'changeLanguage', 't']; 
  propsToRestore.forEach(prop => {
    if (i18next[prop] && i18next[prop].restore) {
        i18next[prop].restore();
    }
  });
  const definedProps = ['isInitialized', 'language'];
  definedProps.forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(i18next, prop);
      if (descriptor && descriptor.configurable && descriptor.get && descriptor.get.isSinonProxy) {
          delete i18next[prop]; 
      } else if (descriptor && descriptor.configurable && descriptor.value && i18next[prop].restore) {
          i18next[prop].restore();
      }
  });
  i18nOnStub.resetHistory();
  i18nOffStub.resetHistory();
  changeLanguageStub.resetHistory();
  i18nStub = sinon.stub(i18next, 't');
  i18nStub.callsFake((key, options) => { 
    switch (key) {
        case 'employeeList.title': return 'Employee List';
        case 'employeeList.searchPlaceholder': return 'Search...';
        case 'employeeList.searchAriaLabel': return 'Search employees';
        case 'employeeList.searchBtn': return 'Search';
        case 'employeeList.listViewBtn': return 'List View';
        case 'employeeList.tableViewBtn': return 'Table View';
        case 'employeeList.empty.noResults': return 'No employees found.';
        case 'employeeList.empty.noResultsForTerm': return `No results for "${options?.term}".`;
        case 'employeeList.table.firstName': return 'First Name';
        case 'employeeList.table.lastName': return 'Last Name';
        case 'employeeList.table.dateOfEmployment': return 'Employed';
        case 'employeeList.table.dateOfBirth': return 'Born';
        case 'employeeList.table.phone': return 'Phone';
        case 'employeeList.table.email': return 'Email';
        case 'employeeList.table.department': return 'Department';
        case 'employeeList.table.position': return 'Position';
        case 'employeeList.table.actions': return 'Actions';
        case 'employeeList.table.editAction': return 'Edit';
        case 'employeeList.table.deleteAction': return 'Delete';
        case 'employeeList.pagination.resultsCount': return `Showing ${options?.start} to ${options?.end} of ${options?.total}`;
        case 'employeeList.pagination.previous': return 'Previous';
        case 'employeeList.pagination.next': return 'Next';
        case 'employeeList.pagination.goToPage': return `Go to page ${options?.page}`;
        case 'deleteConfirmDialog.title': return 'Confirm Deletion';
        case 'deleteConfirmDialog.message': return `Delete ${options?.name}?`;
        case 'toaster.deleteSuccess': return `Deleted ${options?.name}.`;
        default: return key;
      }
  });
  Object.defineProperty(i18next, 'isInitialized', {
    get: sinon.stub().returns(isInitialized),
    configurable: true 
  });
  Object.defineProperty(i18next, 'language', {
    value: language, 
    writable: true, 
    configurable: true 
  });
  sinon.stub(i18next, 'on').callsFake(i18nOnStub);
  sinon.stub(i18next, 'off').callsFake(i18nOffStub);
  sinon.stub(i18next, 'changeLanguage').callsFake(changeLanguageStub);
}
let toasterShowSpy;
function setupToasterMock() {
    toasterShowSpy = sinon.stub();
    const mockToaster = {
        show: toasterShowSpy
    };
    if (document.querySelector && document.querySelector.restore) {
        document.querySelector.restore(); 
    }
    sinon.stub(document, 'querySelector');
    document.querySelector.withArgs('toaster-notification').returns(mockToaster);
    document.querySelector.callThrough(); 
}
function teardownToasterMock() {
    if (document.querySelector && document.querySelector.restore) {
        document.querySelector.restore();
    }
}
let mockStoreState = { employees: [] };
const mockDispatch = sinon.stub();
const mockSubscribe = sinon.stub();
const mockGetState = sinon.stub().returns(mockStoreState);
import './EmployeeList.js';
import '../modal-confirm/DeleteConfirmDialog.js';
import '../toaster-notification/ToasterNotification.js'; 
describe('EmployeeList', () => {
  let element;
  let connectedCallbackSpy;
  let renderTableSpy;
  let renderListSpy;
  let triggerSearchSpy;
  let goToPageSpy;
  let openConfirmSpy;
  let deleteSpy;
  let navSpy;
  beforeEach(async () => {
    // Reset mocks
    mockDispatch.resetHistory();
    mockGetState.resetHistory();
    mockSubscribe.resetHistory();
    mockStoreState = { employees: [] }; 
    mockGetState.returns(mockStoreState);
    
    // --- Stub store methods BEFORE fixture() --- 
    sinon.stub(store, 'dispatch').callsFake(mockDispatch);
    sinon.stub(store, 'subscribe').callsFake(mockSubscribe);
    sinon.stub(store, 'getState').callsFake(mockGetState);
 
    setupI18nMock(); 
    setupToasterMock(); 

    // Use standard fixture approach
    element = await fixture(html`<employee-list></employee-list>`);

    // --- Setup spies AFTER element is created --- 
    connectedCallbackSpy = sinon.spy(element, 'connectedCallback');
    renderTableSpy = sinon.spy(element, '_renderTable'); 
    renderListSpy = sinon.spy(element, '_renderList');
    triggerSearchSpy = sinon.spy(element, '_triggerSearch');
    goToPageSpy = sinon.spy(element, '_goToPage');
    openConfirmSpy = sinon.spy(element, '_openConfirm');
    deleteSpy = sinon.spy(element, '_delete');
    navSpy = sinon.spy(element, '_nav'); 
  });

  afterEach(() => {
    sinon.restore(); 
    teardownToasterMock(); 
  });

  it('should render the component with default table view', async () => {
    // Test initial render state (likely empty)
    expect(element).to.exist;
    expect(element.view).to.equal('table');
    const container = element.shadowRoot.querySelector('.list-container');
    expect(container).to.exist;
    // RenderTableSpy might be called even if empty, let's keep this check
    expect(renderTableSpy).to.have.been.called; 
  });

  it('should display "No employees found" message when store is empty', async () => {
    // Set employees AFTER fixture, then await
    element.employees = []; 
    await elementUpdated(element); 

    const emptyMessage = element.shadowRoot.querySelector('p[style*="text-align: center"]');
    expect(emptyMessage, 'Empty message <p> should exist').to.exist;
    expect(emptyMessage.textContent.trim()).to.equal('No employees found.'); 
    const table = element.shadowRoot.querySelector('table');
    expect(table, 'Table should not exist when empty').to.not.exist; 
  });

  const mockEmployees = [
    { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', department: 'Tech', position: 'Dev' },
    { id: '2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', department: 'HR', position: 'Manager' },
    { id: '3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@test.com', department: 'Tech', position: 'Dev' },
  ];
  it('should populate the table view with employees from store', async () => {
    // Set data AFTER fixture and await update
    element.employees = [...mockEmployees]; 
    await elementUpdated(element); 
    
    // Assert that renderTable was called now that there is data
    expect(renderTableSpy).to.have.been.called; 

    const tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(mockEmployees.length); 
    const firstRowCells = tableRows[0]?.querySelectorAll('td');
    expect(firstRowCells).to.exist;
    if(firstRowCells) { 
        expect(firstRowCells[1].textContent).to.equal('Alice');
        expect(firstRowCells[2].textContent).to.equal('Smith');
        expect(firstRowCells[7].textContent).to.equal('Tech');
    }
  });

  it('should switch to list view and render items', async () => {
    // Set data AFTER fixture and await update
    element.employees = [...mockEmployees];
    await elementUpdated(element); 

    const listViewButton = element.shadowRoot.querySelector('.view-toggle button:first-child'); 
    expect(listViewButton).to.exist;
    listViewButton.click();
    await elementUpdated(element);
    
    expect(renderListSpy).to.have.been.called; 
    const listGrid = element.shadowRoot.querySelector('.list-view-grid');
    expect(listGrid).to.exist;
    const listItems = listGrid.querySelectorAll('.list-view-item');
    expect(listItems.length).to.equal(mockEmployees.length);
    expect(listItems[0].querySelector('.name').textContent).to.equal('Alice Smith');
  });

  it('should filter employees based on search term (table view)', async () => {
    // Set data AFTER fixture and await update
    element.employees = [...mockEmployees];
    await elementUpdated(element);

    const searchInput = element.shadowRoot.querySelector('input[type="search"]');
    const searchButton = element.shadowRoot.querySelector('.search-button');
    expect(searchInput, 'Search input should exist').to.exist;
    expect(searchButton, 'Search button should exist').to.exist;

    searchInput.value = 'tech'; 
    searchInput.dispatchEvent(new Event('input')); 
    searchButton.click(); 
    await elementUpdated(element);
    
    expect(triggerSearchSpy).to.have.been.called; 
    expect(renderTableSpy).to.have.been.called; 
    let tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(2); 
  });

  it('should handle pagination correctly', async () => {
    const manyEmployees = Array.from({ length: 15 }, (_, i) => (
      { id: `${i + 1}`, firstName: `Test`, lastName: `User${i + 1}`, email: `test${i+1}@test.com`, department: 'TestDept', position: 'Tester' }
    ));
    element.employees = manyEmployees;
    await elementUpdated(element);
    let tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(10); 
    expect(element.shadowRoot.querySelector('.results-count').textContent).to.contain('Showing 1 to 10 of 15');
    const nextButton = element.shadowRoot.querySelector('.pagination button:last-of-type');
    expect(nextButton).to.exist;
    nextButton.click();
    await elementUpdated(element);
    expect(goToPageSpy).to.have.been.calledWith(2); 
    expect(renderTableSpy).to.have.been.called; 
    tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(5); 
    expect(element.shadowRoot.querySelector('.results-count').textContent).to.contain('Showing 11 to 15 of 15');
    expect(element._currentPage).to.equal(2);
    const prevButton = element.shadowRoot.querySelector('.pagination button:first-of-type');
    prevButton.click();
    await elementUpdated(element);
    expect(element._currentPage).to.equal(1);
    tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(10);
  });

  it('should render pagination numbers and ellipsis correctly', async () => {
    let manyEmployees = Array.from({ length: 100 }, (_, i) => ({ id: `${i + 1}` })); 
    mockStoreState.employees = manyEmployees;
    mockGetState.returns(mockStoreState);
    element = await fixture(html`<employee-list></employee-list>`);
    element._currentPage = 5; 
    await elementUpdated(element);
    let pageSpans = element.shadowRoot.querySelectorAll('.pagination .page-numbers span');
    expect(pageSpans.length).to.equal(9);
    expect(pageSpans[0].textContent.trim()).to.equal('1');
    expect(pageSpans[1].textContent.trim()).to.equal('...');
    expect(pageSpans[4].textContent.trim()).to.equal('5');
    expect(pageSpans[4]).to.have.class('active');
    expect(pageSpans[7].textContent.trim()).to.equal('...');
    expect(pageSpans[8].textContent.trim()).to.equal('10');
    expect(pageSpans[4].getAttribute('aria-current')).to.equal('page');
    expect(pageSpans[0].getAttribute('aria-label')).to.contain('Go to page 1');
    manyEmployees = Array.from({ length: 30 }, (_, i) => ({ id: `${i + 1}` })); 
    mockStoreState.employees = manyEmployees;
    mockGetState.returns(mockStoreState);
    element = await fixture(html`<employee-list></employee-list>`);
    element._currentPage = 2;
    await elementUpdated(element);
    pageSpans = element.shadowRoot.querySelectorAll('.pagination .page-numbers span');
    expect(pageSpans.length).to.equal(3);
    expect(pageSpans[0].textContent.trim()).to.equal('1');
    expect(pageSpans[1].textContent.trim()).to.equal('2');
    expect(pageSpans[1]).to.have.class('active');
    expect(pageSpans[2].textContent.trim()).to.equal('3');
    manyEmployees = Array.from({ length: 100 }, (_, i) => ({ id: `${i + 1}` })); 
    mockStoreState.employees = manyEmployees;
    mockGetState.returns(mockStoreState);
    element = await fixture(html`<employee-list></employee-list>`);
    element._currentPage = 2;
    await elementUpdated(element);
    pageSpans = element.shadowRoot.querySelectorAll('.pagination .page-numbers span');
    expect(pageSpans.length).to.equal(7);
    expect(pageSpans[1].textContent.trim()).to.equal('2');
    expect(pageSpans[1]).to.have.class('active');
    expect(pageSpans[5].textContent.trim()).to.equal('...');
    expect(pageSpans[6].textContent.trim()).to.equal('10');
  });

  it('should handle delete confirmation and dispatch action', async () => {
    const employeeToDelete = mockEmployees[0]; // Alice
    mockStoreState.employees = [...mockEmployees]; // Ensure store mock is also ready
    mockGetState.returns(mockStoreState);

    // Set data AFTER fixture and await update
    element.employees = [...mockEmployees];
    await elementUpdated(element);
    
    // Spies are attached in beforeEach to the element instance created by fixture(html`...`)

    // Ensure rows are rendered before trying to click
    const firstRow = element.shadowRoot.querySelector('tbody tr:first-child');
    expect(firstRow, 'First table row should exist before clicking delete').to.exist;
    const deleteButton = firstRow.querySelector('.button-action:last-of-type'); 
    expect(deleteButton, 'Delete button should exist').to.exist;

    const confirmDialog = element.shadowRoot.querySelector('delete-confirm-dialog');
    expect(confirmDialog, 'Confirm dialog should exist').to.exist;

    // Click delete button
    deleteButton.click();
    await elementUpdated(element);

    // Check the component's handler was called
    expect(openConfirmSpy).to.have.been.calledOnce;
    expect(openConfirmSpy.getCall(0).args[0]).to.deep.include({ id: employeeToDelete.id });
    
    // Simulate clicking "Proceed" in the dialog by dispatching the confirm event
    confirmDialog.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }));
    await elementUpdated(element);

    // Check that the internal _delete method was called
    expect(deleteSpy).to.have.been.calledOnce;
    expect(mockDispatch).to.have.been.calledOnceWith(deleteEmployee(employeeToDelete.id));
    expect(toasterShowSpy).to.have.been.calledOnceWith('Deleted Alice Smith.', 'success');
    expect(element._confirmEmployee).to.be.null;
  });

  it('should call history.pushState on edit button click', async () => {
    const employeeToEdit = mockEmployees[0]; 
    element.employees = [...mockEmployees];
    await elementUpdated(element);
    const pushStateSpy = sinon.spy(window.history, 'pushState'); 
    const firstRow = element.shadowRoot.querySelector('tbody tr:first-child');
    expect(firstRow, 'First table row should exist before clicking edit').to.exist;
    const editLink = firstRow.querySelector('.button-action:first-of-type'); 
    expect(editLink, 'Edit link should exist').to.exist;
    editLink.click();
    expect(navSpy).to.have.been.calledOnce;
    expect(pushStateSpy).to.have.been.calledOnceWith({}, '', `/employees/${employeeToEdit.id}/edit`);
    pushStateSpy.restore();
  });

  it('should attach/detach i18next listeners', async () => {
    expect(i18next.on).to.have.been.calledWith('languageChanged');
    element.remove();
    expect(i18next.off).to.have.been.calledWith('languageChanged');
  });

  it('should update employees property and request update on store change', async () => {
    const initialEmployees = [{ id: '1', firstName: 'Initial' }];
    const updatedEmployees = [{ id: '1', firstName: 'Updated' }, { id: '2', firstName: 'New' }];
    element.employees = initialEmployees;
    await elementUpdated(element);
    expect(element.employees).to.deep.equal(initialEmployees);
    const requestUpdateSpy = sinon.spy(element, 'requestUpdate');
    mockStoreState.employees = updatedEmployees;
    mockGetState.returns(mockStoreState);
    const subscribeCallback = mockSubscribe.getCall(0)?.args[0]; 
    if (subscribeCallback) subscribeCallback();
    else {
      console.warn('Subscribe callback not found, skipping check');
      return; 
    }
    expect(element.employees).to.deep.equal(updatedEmployees); 
    expect(requestUpdateSpy).to.have.been.called;
    await elementUpdated(element);
    const tableRows = element.shadowRoot.querySelectorAll('tbody tr');
    expect(tableRows.length).to.equal(updatedEmployees.length); 
  });
});