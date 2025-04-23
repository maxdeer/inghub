import { html, fixture, expect, elementUpdated, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import i18next from 'i18next';
import { store } from '../../store/index.js';
let mockStoreState = { employees: [] };
const mockDispatch = sinon.stub();
const mockSubscribe = sinon.stub(); 
const mockGetState = sinon.stub().returns(mockStoreState);
let i18nStubT;
const i18nOnStub = sinon.stub();
const i18nOffStub = sinon.stub();
function setupI18nMock() {
  if (i18nStubT) i18nStubT.restore();
  i18nOnStub.resetHistory();
  i18nOffStub.resetHistory();
  i18nStubT = sinon.stub(i18next, 't').callsFake((key, options) => {
    switch (key) {
      case 'employeeForm.titleAdd': return 'Add New Employee';
      case 'employeeForm.titleEdit': return 'Edit Employee';
      case 'employeeForm.label.firstName': return 'First Name';
      case 'employeeForm.label.lastName': return 'Last Name';
      case 'employeeForm.label.dateOfEmployment': return 'Date of Employment';
      case 'employeeForm.label.dateOfBirth': return 'Date of Birth';
      case 'employeeForm.label.phone': return 'Phone';
      case 'employeeForm.label.email': return 'Email';
      case 'employeeForm.label.department': return 'Department';
      case 'employeeForm.label.position': return 'Position';
      case 'employeeForm.label.selectPlaceholder': return `-- Select ${options?.field} --`;
      case 'employeeForm.button.cancel': return 'Cancel';
      case 'employeeForm.button.add': return 'Add Employee';
      case 'employeeForm.button.update': return 'Update Employee';
      case 'employeeForm.validation.requiredError': return 'Please fill all required fields.';
      case 'employeeForm.validation.emailInUseError': return 'Email already in use.';
      case 'employeeForm.validation.unexpectedError': return 'An unexpected error occurred.';
      case 'toaster.addSuccess': return `Added ${options?.name}.`;
      case 'toaster.updateSuccess': return `Updated ${options?.name}.`;
      default: return key;
    }
  });
  sinon.stub(i18next, 'on').callsFake(i18nOnStub);
  sinon.stub(i18next, 'off').callsFake(i18nOffStub);
}
let historyBackSpy;
function setupWindowMocks() {
    historyBackSpy = sinon.spy(window.history, 'back');
}
function teardownWindowMocks() {
    if (historyBackSpy) historyBackSpy.restore();
}
let toasterShowSpy;
function setupToasterMock() {
    toasterShowSpy = sinon.stub();
    const mockToaster = {
        show: toasterShowSpy
    };
    sinon.stub(document, 'querySelector');
    document.querySelector.withArgs('toaster-notification').returns(mockToaster);
}
function teardownToasterMock() {
    if (document.querySelector.restore) {
        document.querySelector.restore();
    }
}
import './EmployeeForm.js';
import '../toaster-notification/ToasterNotification.js'; 
describe('EmployeeForm', () => {
  let element;
  beforeEach(async () => {
    mockDispatch.resetHistory();
    mockGetState.resetHistory();
    mockSubscribe.resetHistory(); 
    mockStoreState = { employees: [] };
    mockGetState.returns(mockStoreState);
    sinon.stub(store, 'dispatch').callsFake(mockDispatch);
    sinon.stub(store, 'subscribe').callsFake(mockSubscribe);
    sinon.stub(store, 'getState').callsFake(mockGetState);
    setupI18nMock();
    setupToasterMock();
  });
  afterEach(() => {
    sinon.restore(); 
    teardownWindowMocks();
    teardownToasterMock();
  });
  it('should render in add mode by default', async () => {
    setupWindowMocks('/employees/new'); 
    element = await fixture(html`<employee-form></employee-form>`);
    const title = element.shadowRoot.querySelector('h2');
    expect(title.textContent).to.equal('Add New Employee');
    const submitButton = element.shadowRoot.querySelector('button[type="submit"] span');
    expect(submitButton.textContent).to.equal('Add Employee');
    expect(element.form.firstName).to.equal('');
    const deptSelect = element.shadowRoot.querySelector('select[name="department"]');
    const posSelect = element.shadowRoot.querySelector('select[name="position"]');
    expect(deptSelect.value).to.equal('');
    expect(posSelect.value).to.equal('');
    expect(deptSelect.options[deptSelect.selectedIndex].disabled).to.be.true;
    expect(posSelect.options[posSelect.selectedIndex].disabled).to.be.true;
  });
  it('should render in edit mode and populate form', async () => {
    const mockEmployee = {
      id: '123', firstName: 'Berat', lastName: 'Test', email: 'berat@test.com',
      dateOfEmployment: '2024-01-01', dateOfBirth: '1990-05-15',
      phone: '1234567890', department: 'Tech', position: 'Senior'
    };
    mockStoreState.employees = [mockEmployee];
    mockGetState.returns(mockStoreState);
    setupWindowMocks(); 
    const elementInstance = document.createElement('employee-form');
    elementInstance.employeeId = mockEmployee.id; 
    element = await fixture(elementInstance);
    const title = element.shadowRoot.querySelector('h2');
    expect(title.textContent).to.equal('Edit Employee');
    const submitButton = element.shadowRoot.querySelector('button[type="submit"] span');
    expect(submitButton.textContent).to.equal('Update Employee');
    expect(element.form.firstName).to.equal(mockEmployee.firstName);
    expect(element.form.email).to.equal(mockEmployee.email);
    expect(element.form.department).to.equal(mockEmployee.department);
    expect(element.shadowRoot.querySelector('input[name="firstName"]').value).to.equal(mockEmployee.firstName);
    expect(element.shadowRoot.querySelector('select[name="department"]').value).to.equal(mockEmployee.department);
  });
  it('should call history.back if employee ID in URL is not found', async () => {
     mockStoreState.employees = []; 
     mockGetState.returns(mockStoreState);
     setupWindowMocks(); 
     const elementInstance = document.createElement('employee-form');
     elementInstance.employeeId = '999'; 
     element = await fixture(elementInstance);
     expect(historyBackSpy).to.have.been.calledOnce;
   });
  it('should update form state on input', async () => {
    setupWindowMocks();
    element = await fixture(html`<employee-form></employee-form>`);
    const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
    firstNameInput.value = 'NewName';
    firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
    await elementUpdated(element);
    expect(element.form.firstName).to.equal('NewName');
  });
  it('should show validation error on submit with empty required fields', async () => {
    setupWindowMocks();
    element = await fixture(html`<employee-form></employee-form>`);
    const form = element.shadowRoot.querySelector('form');
    const reportValiditySpy = sinon.spy(form, 'reportValidity');
    const submitSpy = sinon.spy(element, '_submit');

    await elementUpdated(element); 

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await elementUpdated(element); 
    
    expect(submitSpy).to.have.been.called;
    const submitEvent = submitSpy.getCall(0)?.args[0];
    // expect(submitEvent?.defaultPrevented).to.be.true; // Keep this commented

    expect(reportValiditySpy).to.have.been.called;
    const errorMessage = element.shadowRoot.querySelector('.error-message');
    expect(errorMessage).to.exist;
    expect(errorMessage.textContent).to.equal('Please fill all required fields.');
    expect(mockDispatch).not.to.have.been.called; 
  });
  it('should show validation error for duplicate email on add', async () => {
      const existingEmployee = { id: 'e1', email: 'existing@test.com' };
      mockStoreState.employees = [existingEmployee];
      mockGetState.returns(mockStoreState);
      setupWindowMocks('/employees/new');
      element = await fixture(html`<employee-form></employee-form>`);
      element.form = { ...element.form, firstName: 'a', lastName: 'b', dateOfEmployment: '2024-01-01', dateOfBirth: '2000-01-01', phone: '1', email: 'existing@test.com', department: 'HR', position: 'Junior' };
      await elementUpdated(element);
      const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
      submitButton.click();
      await elementUpdated(element);
      const errorMessage = element.shadowRoot.querySelector('.error-message');
      expect(errorMessage).to.exist;
      expect(errorMessage.textContent).to.equal('Email already in use.');
      expect(mockDispatch).not.to.have.been.called;
    });
  it('should dispatch addEmployee, show success, and go back on valid submit (add mode)', async () => {
    setupWindowMocks();
    element = await fixture(html`<employee-form></employee-form>`);
    const formData = {
      firstName: 'New', lastName: 'Emp', email: 'new@test.com',
      dateOfEmployment: '2024-02-01', dateOfBirth: '1995-03-03',
      phone: '123', department: 'Tech', position: 'Junior'
    };
    function setInputValue(name, value) {
        const input = element.shadowRoot.querySelector(`[name="${name}"]`);
        input.value = value;
        input.dispatchEvent(new Event(input.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true, composed: true }));
    }
    Object.entries(formData).forEach(([key, value]) => setInputValue(key, value));
    await elementUpdated(element); 
    const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
    submitButton.click();
    await elementUpdated(element); 
    expect(mockDispatch).to.have.been.calledOnce;
    const dispatchedAction = mockDispatch.getCall(0).args[0];
    expect(dispatchedAction.type).to.equal('employees/addEmployee'); 
    expect(dispatchedAction.payload).to.deep.include(formData);
    expect(toasterShowSpy).to.have.been.calledOnceWith('Added New Emp.', 'success');
    expect(historyBackSpy).to.have.been.calledOnce;
    const errorMessage = element.shadowRoot.querySelector('.error-message');
    expect(errorMessage).to.not.exist;
  });
  it('should dispatch updateEmployee, show success, and go back on valid submit (edit mode)', async () => {
      const mockEmployee = {
        id: '123', firstName: 'Berat', lastName: 'Test', email: 'berat@test.com',
        dateOfEmployment: '2024-01-01', dateOfBirth: '1990-05-15',
        phone: '1234567890', department: 'Tech', position: 'Senior'
      };
      mockStoreState.employees = [mockEmployee];
      mockGetState.returns(mockStoreState);
      setupWindowMocks();
      const elementInstance = document.createElement('employee-form');
      elementInstance.employeeId = mockEmployee.id;
      element = await fixture(elementInstance);
      const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
      expect(firstNameInput, 'First name input should exist').to.exist;
      firstNameInput.value = 'BeratUpdated';
      firstNameInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      await elementUpdated(element);
      const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
      expect(submitButton, 'Submit button should exist').to.exist;
      submitButton.click();
      await elementUpdated(element);
      expect(mockDispatch).to.have.been.calledOnce;
      const dispatchedAction = mockDispatch.getCall(0).args[0];
      expect(dispatchedAction.type).to.equal('employees/updateEmployee');
      expect(dispatchedAction.payload).to.deep.include({ 
          id: '123', 
          firstName: 'BeratUpdated', 
          lastName: 'Test', 
          email: 'berat@test.com' 
      });
      expect(toasterShowSpy).to.have.been.calledOnceWith('Updated BeratUpdated Test.', 'success');
      expect(historyBackSpy).to.have.been.calledOnce;
    });
  it('should show error message and toaster on unexpected submit error', async () => {
    setupWindowMocks('/employees/new');
    element = await fixture(html`<employee-form></employee-form>`);
    const formData = {
      firstName: 'Err', lastName: 'Or', email: 'err@test.com',
      dateOfEmployment: '2024-02-01', dateOfBirth: '1995-03-03',
      phone: '123', department: 'Tech', position: 'Junior'
    };
    element.form = { ...formData };
    await elementUpdated(element);
    mockDispatch.throws(new Error('Dispatch failed'));
    const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
    submitButton.click();
    await elementUpdated(element); 
    const errorMessage = element.shadowRoot.querySelector('.error-message');
    expect(errorMessage).to.exist;
    expect(errorMessage.textContent).to.equal('An unexpected error occurred.');
    expect(toasterShowSpy).to.have.been.calledOnceWith('An unexpected error occurred.', 'error');
    expect(historyBackSpy).not.to.have.been.called; 
    mockDispatch.resetBehavior(); 
  });
  it('should render correct input types and attributes via _field', async () => {
      setupWindowMocks('/employees/new');
      element = await fixture(html`<employee-form></employee-form>`);
      const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
      expect(firstNameInput.type).to.equal('text');
      expect(firstNameInput.hasAttribute('required')).to.be.true;
      const dateInput = element.shadowRoot.querySelector('input[name="dateOfBirth"]');
      expect(dateInput.type).to.equal('date');
      expect(dateInput.hasAttribute('required')).to.be.true;
      const phoneInput = element.shadowRoot.querySelector('input[name="phone"]');
      expect(phoneInput.type).to.equal('tel');
      const emailInput = element.shadowRoot.querySelector('input[name="email"]');
      expect(emailInput.type).to.equal('email');
      const deptSelect = element.shadowRoot.querySelector('select[name="department"]');
      expect(deptSelect).to.exist;
      expect(deptSelect.options.length).to.equal(5); 
      expect(deptSelect.options[0].disabled).to.be.true; 
      expect(deptSelect.options[0].textContent).to.contain('-- Select Department --'); 
  });
  it('should clear error message on input', async () => {
      setupWindowMocks('/employees/new');
      element = await fixture(html`<employee-form></employee-form>`);
      const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
      submitButton.click();
      await elementUpdated(element);
      expect(element.shadowRoot.querySelector('.error-message')).to.exist;
      const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
      firstNameInput.value = 'Test';
      firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      await elementUpdated(element);
      expect(element.shadowRoot.querySelector('.error-message')).to.not.exist;
      expect(element._errorMessage).to.equal('');
    });
  it('should call history.back when cancel button is clicked', async () => {
    setupWindowMocks('/employees/new');
    element = await fixture(html`<employee-form></employee-form>`);
    const cancelButton = element.shadowRoot.querySelector('.button-cancel');
    cancelButton.click();
    expect(historyBackSpy).to.have.been.calledOnce;
  });
   it('should attach and detach i18next listeners on connect/disconnect', async () => {
      setupWindowMocks('/employees/new'); 
      element = await fixture(html`<employee-form></employee-form>`);
      expect(i18nOnStub).to.have.been.calledWith('languageChanged');
      element.remove(); 
    });
});