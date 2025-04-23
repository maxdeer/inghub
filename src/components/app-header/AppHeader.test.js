import { html, fixture, expect, elementUpdated, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import i18next from 'i18next';

// --- Mock i18next --- 
let i18nStub;
const i18nOnStub = sinon.stub();
const i18nOffStub = sinon.stub();
const changeLanguageStub = sinon.stub();

function setupI18nMock(isInitialized = true, language = 'en') {
  // Restore existing stubs if they exist
  if (i18nStub && i18nStub.restore) {
    i18nStub.restore();
  }
  // Restore stubs for properties and methods if they exist
  const propsToRestore = ['isInitialized', 'language', 'on', 'off', 'changeLanguage'];
  propsToRestore.forEach(prop => {
    if (i18next[prop] && i18next[prop].restore) {
        i18next[prop].restore();
    }
  });

  // Reset history of standalone stubs
  i18nOnStub.resetHistory();
  i18nOffStub.resetHistory();
  changeLanguageStub.resetHistory();

  // Stub the 't' function
  i18nStub = sinon.stub(i18next, 't');
  i18nStub.withArgs('appHeader.languageLabel').returns('Language');
  i18nStub.withArgs('appHeader.employees').returns('Employees');
  i18nStub.withArgs('appHeader.addNew').returns('Add New');
  i18nStub.callThrough(); // Allow other keys to pass through if needed

  // Stub properties using Object.defineProperty and sinon.stub().get()
  Object.defineProperty(i18next, 'isInitialized', {
    get: sinon.stub().returns(isInitialized),
    configurable: true // Allow restore
  });
  Object.defineProperty(i18next, 'language', {
    value: language, // Use value directly for simple properties if not function
    writable: true, // Allow changes if necessary
    configurable: true // Allow restore
  });

  // Stub methods directly
  sinon.stub(i18next, 'on').callsFake(i18nOnStub);
  sinon.stub(i18next, 'off').callsFake(i18nOffStub);
  sinon.stub(i18next, 'changeLanguage').callsFake(changeLanguageStub);
}

// --- Mock window history and location --- 
// Basic mocks, can be enhanced if needed
let pushStateSpy;
// let currentPathname = '/'; // No longer mocking location.pathname directly
// let originalLocationDescriptor; // No longer needed

function setupWindowMocks(/*initialPath = '/'*/) { // Parameter no longer needed
  // Only mock pushState, as mocking location is unreliable
  pushStateSpy = sinon.spy(window.history, 'pushState');
  // currentPathname = initialPath; // Remove location related code
}

function teardownWindowMocks() {
    // Restore pushState spy
    if (pushStateSpy && pushStateSpy.restore) {
        pushStateSpy.restore();
    }
    // No need to restore location
}

// --- Import Component --- 
import './AppHeader.js';

describe('AppHeader', () => {
  let element;
  // --- Spies for internal methods ---
  let navigateSpy;
  let changeLanguageSpy;
  let isActiveSpy;
  let onLanguageChangedSpy;
  let onI18nInitializedSpy;

  beforeEach(async () => {
    // Reset mocks for each test
    setupI18nMock(); 
    setupWindowMocks(); // Only mocks history.pushState now
    
    element = await fixture(html`<app-header></app-header>`);

    // --- Setup spies AFTER element is created --- 
    // Spy directly on INSTANCE methods
    navigateSpy = sinon.spy(element, '_navigate');
    changeLanguageSpy = sinon.spy(element, '_changeLanguage');
    isActiveSpy = sinon.spy(element, '_isActive');
    // Spying on bound arrow functions in constructor is harder, test their effect instead
    // onLanguageChangedSpy = sinon.spy(element, '_onLanguageChanged');
    // onI18nInitializedSpy = sinon.spy(element, '_onI18nInitialized');
  });

  afterEach(() => {
    // Restore all sinon mocks and spies
    sinon.restore(); // Global restore handles instance spies too
    teardownWindowMocks();
  });

  it('should render the header with logo and nav', async () => {
    // Check initial render
    expect(element.shadowRoot.querySelector('.logo').textContent).to.equal('ING');
    const navLinks = element.shadowRoot.querySelectorAll('nav a');
    expect(navLinks.length).to.equal(1); // Only Employees link for now
    expect(navLinks[0].textContent).to.contain('Employees'); 

    const addButton = element.shadowRoot.querySelector('.button-add-new');
    expect(addButton).to.exist;
    expect(addButton.textContent).to.contain('Add New');

    const langSelector = element.shadowRoot.querySelector('.language-selector');
    expect(langSelector).to.exist;
    // isActive might be called during initial render/connection before spy is attached
    // await elementUpdated(element); // Ensure render cycle completes
    // expect(isActiveSpy).to.have.been.called; // Remove this check from initial render
  });

  it('should render fallback text if i18next is not ready', async () => {
    // Re-setup mocks with i18next not initialized
    sinon.restore(); // Clean previous mocks
    setupI18nMock(false); // Setup as not initialized
    setupWindowMocks();
    element = await fixture(html`<app-header></app-header>`);

    const employeesLink = element.shadowRoot.querySelector('nav a span');
    const addButton = element.shadowRoot.querySelector('.button-add-new span');
    const langLabel = element.shadowRoot.querySelector('.language-label');

    expect(employeesLink.textContent).to.equal('Employees'); // Uses fallback property
    expect(addButton.textContent).to.equal('Add New'); // Uses fallback property
    expect(langLabel.textContent).to.contain('Language:'); // Uses fallback property
    // Language buttons should be disabled
    const langButtons = element.shadowRoot.querySelectorAll('.language-selector button');
    expect(langButtons[0]).to.have.attribute('disabled');
    expect(langButtons[1]).to.have.attribute('disabled');
  });

  it('should add active class to the correct nav link and call _isActive', async () => {
    const employeesLink = element.shadowRoot.querySelector('nav a[href="/employees"]');
    isActiveSpy.resetHistory(); // Reset spy before action

    // Simulate navigation by directly calling pushState (which is spied on)
    window.history.pushState({}, '', '/employees');
    // Dispatch a popstate event which the component likely listens for (or should listen for)
    window.dispatchEvent(new PopStateEvent('popstate')); 
    // Trigger component update cycle
    element.requestUpdate(); 
    await elementUpdated(element);

    // Check if the component correctly updated the class based on the new (real) window.location
    expect(employeesLink).to.have.class('active');
    // Check if the component's check function was called during the update
    expect(isActiveSpy).to.have.been.called; 
  });

  it('should call _navigate and history.pushState on nav link click', async () => {
    const employeesLink = element.shadowRoot.querySelector('nav a[href="/employees"]');
    // Directly click
    employeesLink.click();
    await elementUpdated(element); // Wait for potential re-render if any
    
    expect(navigateSpy).to.have.been.calledOnce; 
    expect(pushStateSpy).to.have.been.calledOnceWith({}, '', '/employees');
  });

  it('should call _navigate and history.pushState on add new button click', async () => {
    const addButton = element.shadowRoot.querySelector('.button-add-new');
    // Directly click
    addButton.click();
    await elementUpdated(element);

    expect(navigateSpy).to.have.been.calledOnce;
    expect(pushStateSpy).to.have.been.calledOnceWith({}, '', '/employees/new');
  });

  it('should call _changeLanguage and i18next.changeLanguage when language button is clicked', async () => {
    const trButton = element.shadowRoot.querySelector('button.button-lang:nth-of-type(2)');
    // Directly click
    trButton.click();
    await elementUpdated(element);
    
    expect(changeLanguageSpy).to.have.been.calledOnceWith('tr');
    expect(changeLanguageStub).to.have.been.calledOnceWith('tr'); // Checks the i18next mock

    // Reset spies/stubs for next check
    changeLanguageSpy.resetHistory();
    changeLanguageStub.resetHistory();

    const enButton = element.shadowRoot.querySelector('button.button-lang:nth-of-type(1)');
    // Directly click
    enButton.click();
    await elementUpdated(element);

    expect(changeLanguageSpy).to.have.been.calledOnceWith('en');
    expect(changeLanguageStub).to.have.been.calledOnceWith('en'); 
  });

  it('should add active class to the current language button', async () => {
    const enButton = element.shadowRoot.querySelector('button.button-lang:nth-of-type(1)');
    const trButton = element.shadowRoot.querySelector('button.button-lang:nth-of-type(2)');
    expect(enButton).to.have.class('active'); // Default is 'en' from mock
    expect(trButton).not.to.have.class('active');

    // Simulate language change (update mock and re-render)
    // Restore the stubbed property correctly
    const languageStub = Object.getOwnPropertyDescriptor(i18next, 'language');
    if (languageStub && languageStub.configurable) {
      delete i18next.language; // Remove the old stub
      // Define the new property value
      Object.defineProperty(i18next, 'language', {
          value: 'tr',
          writable: true,
          configurable: true
      });
    } else {
      console.warn('Could not re-stub i18next.language for test');
      // Fallback or alternative if direct defineProperty fails:
      // Manually trigger the component's language change handler if possible
      // element._onLanguageChanged(); 
    }

    element.requestUpdate();
    await elementUpdated(element);

    expect(enButton).not.to.have.class('active');
    expect(trButton).to.have.class('active');
  });

  it('should request update when i18next initialized event fires', async () => {
    sinon.restore(); 
    setupI18nMock(false);
    setupWindowMocks();
    element = await fixture(html`<app-header></app-header>`);
    const requestUpdateSpy = sinon.spy(element, 'requestUpdate');

    const initializedListener = i18nOnStub.getCalls().find(call => call.args[0] === 'initialized').args[1];
    initializedListener(); 

    expect(element._i18nReady).to.be.true;
    expect(requestUpdateSpy).to.have.been.called;
    requestUpdateSpy.restore(); // Restore spy specific to this test
  });
  
  it('should request update when i18next languageChanged event fires', async () => {
    const requestUpdateSpy = sinon.spy(element, 'requestUpdate');
    // Find the listener attached during setup
    const languageChangedListener = i18nOnStub.getCalls().find(call => call.args[0] === 'languageChanged').args[1];
    languageChangedListener(); // Simulate event
    expect(requestUpdateSpy).to.have.been.called;
    requestUpdateSpy.restore();
  });

  it('should not call _changeLanguage or i18next.changeLanguage if i18n is not ready', async () => {
    sinon.restore(); // Clean previous mocks
    setupI18nMock(false); // Setup as not initialized
    setupWindowMocks();
    element = await fixture(html`<app-header></app-header>`);
    // Re-spy on the new instance
    changeLanguageSpy = sinon.spy(element, '_changeLanguage'); 

    const trButton = element.shadowRoot.querySelector('button.button-lang:nth-of-type(2)');
    trButton.click();
    await elementUpdated(element);
    
    // Internal method should NOT be called if i18n isn't ready
    // expect(changeLanguageSpy).to.have.been.calledOnceWith('tr'); 
    expect(changeLanguageSpy).not.to.have.been.called;
    expect(changeLanguageStub).not.to.have.been.called; // External i18next method is NOT called
  });

  it('should attach and detach i18next listeners on connect/disconnect', async () => {
     // Check listeners attached in beforeEach/fixture
     expect(i18nOnStub).to.have.been.calledWith('languageChanged');
     expect(i18nOnStub).to.have.been.calledWith('initialized');
     const initialOnCount = i18nOnStub.callCount;
     const initialOffCount = i18nOffStub.callCount;
     
     // Simulate removal from DOM
     element.remove(); 
     // disconnectedCallback should call i18next.off
     expect(i18nOffStub.callCount).to.be.greaterThan(initialOffCount);
     expect(i18nOffStub).to.have.been.calledWith('languageChanged');
     expect(i18nOffStub).to.have.been.calledWith('initialized');

     // Optional: Re-add to check connect again
     const container = await fixture(html`<div></div>`);
     container.appendChild(element);
     await elementUpdated(element);
     expect(i18nOnStub.callCount).to.be.greaterThan(initialOnCount);
   });
}); 