import { html, fixture, expect, oneEvent, elementUpdated } from '@open-wc/testing';
import sinon from 'sinon';
import i18next from 'i18next'; 
import './DeleteConfirmDialog.js';
sinon.stub(i18next, 't').callsFake((key) => {
  if (key === 'deleteConfirmDialog.cancel') return 'Cancel';
  if (key === 'deleteConfirmDialog.proceed') return 'Proceed';
  return key; 
});
sinon.stub(i18next, 'on');
sinon.stub(i18next, 'off');
describe('DeleteConfirmDialog', () => {
  it('should not be visible initially', async () => {
    const el = await fixture(html`<delete-confirm-dialog></delete-confirm-dialog>`);
    expect(el.openState).to.be.false;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop).not.to.have.class('open');
    expect(getComputedStyle(backdrop).visibility).to.equal('hidden'); 
  });
  it('should become visible when open() is called', async () => {
    const el = await fixture(html`<delete-confirm-dialog></delete-confirm-dialog>`);
    el.open();
    await elementUpdated(el);
    expect(el.openState).to.be.true;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop).to.have.class('open');
    expect(getComputedStyle(backdrop).visibility).to.equal('visible'); 
  });
  it('should close when close() is called', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el); 
    expect(el.openState).to.be.true;
    el.close();
    await elementUpdated(el);
    expect(el.openState).to.be.false;
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    expect(backdrop).not.to.have.class('open');
    expect(getComputedStyle(backdrop).visibility).to.equal('hidden'); 
  });
  it('should close when the backdrop is clicked', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    backdrop.click();
    await elementUpdated(el);
    expect(el.openState).to.be.false;
  });
   it('should close when the close button (X) is clicked', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const closeButton = el.shadowRoot.querySelector('.close-button');
    closeButton.click();
    await elementUpdated(el);
    expect(el.openState).to.be.false;
  });
  it('should not close when the dialog content is clicked', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const closeSpy = sinon.spy(el, 'close'); 
    const dialog = el.shadowRoot.querySelector('.dialog');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = sinon.spy(clickEvent, 'stopPropagation');
    dialog.dispatchEvent(clickEvent);
    await elementUpdated(el);
    expect(el.openState).to.be.true; 
    expect(closeSpy).not.to.have.been.called;
    expect(stopPropagationSpy).to.have.been.called; 
  });
  it('should display the provided title', async () => {
    const testTitle = 'Confirm Deletion';
    const el = await fixture(html`<delete-confirm-dialog .openState=${true} .title=${testTitle}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const titleElement = el.shadowRoot.querySelector('#dialog-title');
    expect(titleElement).to.exist;
    expect(titleElement.textContent).to.equal(testTitle);
  });
  it('should display the provided message', async () => {
    const testMessage = 'Are you sure you want to delete this item?';
    const el = await fixture(html`<delete-confirm-dialog .openState=${true} .message=${testMessage}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const messageElement = el.shadowRoot.querySelector('#dialog-message');
    expect(messageElement).to.exist;
    expect(messageElement.textContent).to.equal(testMessage);
  });
  it('should render translated button texts', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const cancelButton = el.shadowRoot.querySelector('.button-cancel span');
    const proceedButton = el.shadowRoot.querySelector('.button-destructive span');
    expect(cancelButton.textContent).to.equal('Cancel'); 
    expect(proceedButton.textContent).to.equal('Proceed'); 
  });
  it('should dispatch "confirm" event and close when proceed button is clicked', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const confirmEvent = oneEvent(el, 'confirm');
    const proceedButton = el.shadowRoot.querySelector('.button-destructive');
    proceedButton.click();
    const eventDetail = await confirmEvent;
    expect(eventDetail).to.be.ok; 
    await elementUpdated(el);
    expect(el.openState).to.be.false; 
  });
  it('should not dispatch "confirm" event but should close when cancel button is clicked', async () => {
    const el = await fixture(html`<delete-confirm-dialog .openState=${true}></delete-confirm-dialog>`);
    await elementUpdated(el);
    const confirmSpy = sinon.spy();
    el.addEventListener('confirm', confirmSpy);
    const cancelButton = el.shadowRoot.querySelector('.button-cancel');
    cancelButton.click();
    await elementUpdated(el);
    expect(confirmSpy).not.to.have.been.called; 
    expect(el.openState).to.be.false; 
  });
  it('should call i18next listeners on connect/disconnect', async () => {
      const el = await fixture(html`<delete-confirm-dialog></delete-confirm-dialog>`);
      expect(i18next.on).to.have.been.calledWith('languageChanged');
      el.remove(); 
      expect(i18next.off).to.have.been.calledWith('languageChanged');
  });
});