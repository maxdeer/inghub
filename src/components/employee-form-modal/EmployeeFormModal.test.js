import { html, fixture, expect, elementUpdated, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import i18next from 'i18next';
import { store } from '../../store/index.js';
let mockStoreState = { employees: [] };
const mockDispatch = sinon.stub();
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
            case 'employeeForm.button.add': return 'Add';      
            case 'employeeForm.button.update': return 'Update';  
            case 'employeeForm.validation.requiredError': return 'Required fields missing.';
            case 'employeeForm.validation.emailInUseError': return 'Email duplicate.';
            case 'employeeForm.validation.unexpectedError': return 'Unexpected error.';
            case 'toaster.addSuccess': return `Added ${options?.name}.`;
            case 'toaster.updateSuccess': return `Updated ${options?.name}.`;
            default: return key;
        }
    });
    sinon.stub(i18next, 'on').callsFake(i18nOnStub);
    sinon.stub(i18next, 'off').callsFake(i18nOffStub);
}
let toasterShowSpy;
function setupToasterMock() {
    toasterShowSpy = sinon.stub();
    const mockToaster = { show: toasterShowSpy };
    sinon.stub(document, 'querySelector');
    document.querySelector.withArgs('toaster-notification').returns(mockToaster);
}
function teardownToasterMock() {
    if (document.querySelector.restore) {
        document.querySelector.restore();
    }
}
import './EmployeeFormModal.js';
import '../base-modal/BaseModal.js'; 
import '../toaster-notification/ToasterNotification.js';
describe('EmployeeFormModal', () => {
    console.log('--- EmployeeFormModal.test.js RUNNING ---');
    let element;
    let baseModal;
    let openSpy, closeSpy, submitSpy, onInputSpy, resetSpy, handleOpenEventSpy;
    beforeEach(async () => {
        mockDispatch.resetHistory();
        mockGetState.resetHistory();
        mockStoreState = { employees: [] };
        mockGetState.returns(mockStoreState);
        sinon.stub(store, 'dispatch').callsFake(mockDispatch);
        sinon.stub(store, 'getState').callsFake(mockGetState);
        setupI18nMock();
        setupToasterMock();
        element = await fixture(html`<employee-form-modal></employee-form-modal>`);
        baseModal = element.shadowRoot.querySelector('base-modal');
        openSpy = sinon.spy(element, 'open');
        closeSpy = sinon.spy(element, 'close');
        submitSpy = sinon.spy(element, '_submit');
        onInputSpy = sinon.spy(element, '_onInput');
        resetSpy = sinon.spy(element, '_reset');
        handleOpenEventSpy = sinon.spy(element, '_handleOpenEvent');
    });
    afterEach(() => {
        sinon.restore(); 
        teardownToasterMock();
        window.removeEventListener('open-employee-form', element._boundHandleOpenEvent);
    });
    it('should not be open initially', async () => {
        expect(element._isOpen).to.be.false;
        expect(baseModal.isOpen).to.be.false;
        expect(openSpy).not.to.have.been.called;
    });
    it('should open in add mode when open() is called without ID', async () => {
        element.open(); 
        await elementUpdated(element);
        expect(resetSpy).to.have.been.called; 
        expect(element._isOpen).to.be.true;
        expect(baseModal.isOpen).to.be.true;
        expect(element._employeeId).to.be.null;
        expect(element._title).to.equal('Add New Employee');
        expect(baseModal.title).to.equal('Add New Employee');
        const submitButton = element.shadowRoot.querySelector('button[type="submit"] span');
        expect(submitButton.textContent).to.equal('Add');
    });
    it('should open in edit mode when open() is called with an ID', async () => {
        const mockEmployee = { id: 'e1', firstName: 'Test', lastName: 'User', email: 'test@modal.com' };
        mockStoreState.employees = [mockEmployee];
        mockGetState.returns(mockStoreState);
        resetSpy.resetHistory(); 
        element.open(mockEmployee.id);
        await elementUpdated(element);
        expect(resetSpy).to.have.been.called;
        expect(element._isOpen).to.be.true;
        expect(element._employeeId).to.equal(mockEmployee.id);
        expect(element._title).to.equal('Edit Employee');
        expect(baseModal.title).to.equal('Edit Employee');
        expect(element._form.firstName).to.equal('Test'); 
        const submitButton = element.shadowRoot.querySelector('button[type="submit"] span');
        expect(submitButton.textContent).to.equal('Update');
    });
    it('should open in edit mode when "open-employee-form" event is dispatched with ID', async () => {
        const mockEmployee = { id: 'e2', firstName: 'Event', lastName: 'User' };
        mockStoreState.employees = [mockEmployee];
        mockGetState.returns(mockStoreState);
        openSpy.resetHistory(); 
        resetSpy.resetHistory();
        window.dispatchEvent(new CustomEvent('open-employee-form', { 
            detail: { employeeId: mockEmployee.id },
            bubbles: true,
            composed: true
        }));
        await elementUpdated(element);
        expect(openSpy).to.have.been.calledOnceWith(mockEmployee.id);
        expect(resetSpy).to.have.been.called;
        expect(element._isOpen).to.be.true;
        expect(element._employeeId).to.equal(mockEmployee.id);
        expect(element._title).to.equal('Edit Employee');
        expect(element._form.firstName).to.equal('Event');
    });
    it('should open in add mode when "open-employee-form" event is dispatched without ID', async () => {
        window.dispatchEvent(new CustomEvent('open-employee-form'));
        await elementUpdated(element);
        expect(element._isOpen).to.be.true;
        expect(baseModal.isOpen).to.be.true;
        expect(element._employeeId).to.be.null;
        expect(element._title).to.equal('Add New Employee');
    });
    it('should close when close() is called', async () => {
        element.open();
        await elementUpdated(element);
        expect(element._isOpen).to.be.true;
        element.close();
        await elementUpdated(element);
        expect(element._isOpen).to.be.false;
        expect(baseModal.isOpen).to.be.false; 
    });
    it('should close when cancel button is clicked', async () => {
        element.open();
        await elementUpdated(element);
        const cancelButton = element.shadowRoot.querySelector('.button-cancel');
        cancelButton.click();
        await elementUpdated(element);
        expect(closeSpy).to.have.been.calledOnce;
        expect(element._isOpen).to.be.false;
    });
    it('should close when base-modal dispatches "modal-close"', async () => {
        element.open();
        await elementUpdated(element);
        baseModal.dispatchEvent(new CustomEvent('modal-close'));
        await elementUpdated(element);
        expect(closeSpy).to.have.been.calledOnce;
        expect(element._isOpen).to.be.false;
    });
    it('should update form state on input', async () => {
        element.open();
        await elementUpdated(element);
        const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
        firstNameInput.value = 'ModalInput';
        firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
        await elementUpdated(element);
        expect(onInputSpy).to.have.been.called; 
        expect(element._form.firstName).to.equal('ModalInput');
    });
    it('should show validation error on submit with empty required fields', async () => {
        element.open();
        await elementUpdated(element);
        const form = element.shadowRoot.querySelector('form');
        const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
        const reportValiditySpy = sinon.spy(form, 'reportValidity');
        submitButton.click(); 
        await elementUpdated(element);
        expect(submitSpy).to.have.been.called; 
        expect(reportValiditySpy).to.have.been.called;
        const errorMessage = element.shadowRoot.querySelector('.error-message');
        expect(errorMessage).to.exist;
        expect(errorMessage.textContent).to.equal('Required fields missing.');
        expect(mockDispatch).not.to.have.been.called;
    });
    it('should dispatch addEmployee, close, and show toaster on valid submit (add mode)', async () => {
        element.open();
        await elementUpdated(element);
        submitSpy.resetHistory(); 
        mockDispatch.resetHistory();
        closeSpy.resetHistory();
        toasterShowSpy.resetHistory();
        const formData = {
          firstName: 'ModalAdd', lastName: 'Test', email: 'modaladd@test.com',
          dateOfEmployment: '2024-03-01', dateOfBirth: '1998-01-01',
          phone: '987', department: 'Sales', position: 'Rep'
        };
        function setInputValue(name, value) {
            const input = element.shadowRoot.querySelector(`[name="${name}"]`);
            expect(input, `Input for ${name} should exist`).to.exist;
            input.value = value;
            const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
            input.dispatchEvent(new Event(eventName, { bubbles: true, composed: true }));
        }
        Object.entries(formData).forEach(([key, value]) => setInputValue(key, value));
        await elementUpdated(element); 
        const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
        submitButton.click();
        await elementUpdated(element); 
        expect(submitSpy).to.have.been.calledOnce; 
        expect(mockDispatch).to.have.been.calledOnce; 
        const dispatchedAction = mockDispatch.getCall(0).args[0];
        expect(dispatchedAction.type).to.equal('employees/addEmployee'); 
        expect(dispatchedAction.payload).to.deep.include(formData);
        expect(closeSpy).to.have.been.calledOnce; 
        expect(toasterShowSpy).to.have.been.calledOnceWith('Added ModalAdd Test.', 'success');
    });
    it('should dispatch updateEmployee, close, and show toaster on valid submit (edit mode)', async () => {
        const mockEmployee = { id: 'e1', firstName: 'Test', lastName: 'User', email: 'test@modal.com', department: 'HR', position: 'Manager' };
        mockStoreState.employees = [mockEmployee];
        mockGetState.returns(mockStoreState);
        element.open(mockEmployee.id);
        await elementUpdated(element);
        submitSpy.resetHistory();
        mockDispatch.resetHistory();
        closeSpy.resetHistory();
        toasterShowSpy.resetHistory();
        const firstNameInput = element.shadowRoot.querySelector('input[name="firstName"]');
        expect(firstNameInput, 'Input for firstName should exist').to.exist;
        firstNameInput.value = 'TestUpdated';
        firstNameInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        await elementUpdated(element); 
        const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
        submitButton.click();
        await elementUpdated(element);
        expect(submitSpy).to.have.been.calledOnce;
        expect(mockDispatch).to.have.been.calledOnce;
        const dispatchedAction = mockDispatch.getCall(0).args[0];
        expect(dispatchedAction.type).to.equal('employees/updateEmployee');
        expect(dispatchedAction.payload).to.deep.include({ id: mockEmployee.id, firstName: 'TestUpdated' });
        expect(closeSpy).to.have.been.calledOnce;
        expect(toasterShowSpy).to.have.been.calledOnceWith('Updated TestUpdated User.', 'success');
    });
    it('should show error message and toaster on unexpected submit error', async () => {
        element.open(); 
        await elementUpdated(element);
        submitSpy.resetHistory();
        mockDispatch.resetHistory();
        toasterShowSpy.resetHistory();
        const formData = {
          firstName: 'Err', lastName: 'Or', email: 'err@test.com',
          dateOfEmployment: '2024-02-01', dateOfBirth: '1995-03-03',
          phone: '123', department: 'Tech', position: 'Junior'
        };
        function setInputValue(name, value) {
            const input = element.shadowRoot.querySelector(`[name="${name}"]`);
            expect(input, `Input for ${name} should exist`).to.exist;
            input.value = value;
            const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
            input.dispatchEvent(new Event(eventName, { bubbles: true, composed: true }));
        }
        Object.entries(formData).forEach(([key, value]) => setInputValue(key, value));
        await elementUpdated(element); 
        mockDispatch.throws(new Error('Dispatch failed'));
        const submitButton = element.shadowRoot.querySelector('button[type="submit"]');
        submitButton.click();
        await elementUpdated(element); 
        expect(submitSpy).to.have.been.calledOnce;
        const errorMessage = element.shadowRoot.querySelector('.error-message');
        expect(errorMessage).to.exist;
        expect(errorMessage.textContent).to.equal('Unexpected error.');
        expect(toasterShowSpy).to.have.been.calledOnceWith('Unexpected error.', 'error');
        expect(closeSpy).not.to.have.been.called; 
        mockDispatch.resetBehavior(); 
    });
    it('should attach and detach i18next listeners on connect/disconnect', async () => {
        expect(i18nOnStub).to.have.been.calledWith('languageChanged');
        element.remove(); 
        expect(i18nOffStub).to.have.been.calledWith('languageChanged');
    });
    it('should attach and detach window event listener on connect/disconnect', async () => {
        const addSpy = sinon.spy(window, 'addEventListener');
        const removeSpy = sinon.spy(window, 'removeEventListener');
        element.remove(); 
        element = await fixture(html`<employee-form-modal></employee-form-modal>`);
        expect(addSpy).to.have.been.calledWith('open-employee-form', element._boundHandleOpenEvent);
        element.remove();
        expect(removeSpy).to.have.been.calledWith('open-employee-form', element._boundHandleOpenEvent);
        addSpy.restore();
        removeSpy.restore();
    });
});