import { html, fixture, expect, oneEvent, elementUpdated } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands'; // For simulating key presses

import './BaseModal.js';

describe('BaseModal', () => {
  it('should not be visible initially', async () => {
    const el = await fixture(html`<base-modal></base-modal>`);
    expect(el.isOpen).to.be.false;
    expect(el).not.to.have.attribute('isOpen');
    expect(el.shadowRoot.querySelector('.backdrop')).to.not.exist; 
  });

  it('should render open if isOpen property is true initially', async () => {
    const el = await fixture(html`<base-modal .isOpen=${true}></base-modal>`);
    expect(el.isOpen).to.be.true;
    expect(el).to.have.attribute('isOpen');
    expect(el.shadowRoot.querySelector('.backdrop')).to.exist;
    expect(el.shadowRoot.querySelector('.dialog')).to.exist;
    // Check visibility using computed styles (may depend on transitions)
    // expect(isVisible(el)).to.be.true; 
    expect(getComputedStyle(el.shadowRoot.querySelector('.backdrop')).display).to.not.equal('none');
  });

  it('should open when open() method is called', async () => {
    const el = await fixture(html`<base-modal></base-modal>`);
    expect(el.isOpen).to.be.false;

    const openEvent = oneEvent(el, 'modal-open');
    el.open();
    await elementUpdated(el);

    expect(el.isOpen).to.be.true;
    expect(el).to.have.attribute('isOpen');
    expect(el.shadowRoot.querySelector('.backdrop')).to.exist;
    expect(await openEvent).to.be.ok; // Check event was dispatched
  });

  it('should close when close() method is called', async () => {
    const el = await fixture(html`<base-modal .isOpen=${true}></base-modal>`);
    expect(el.isOpen).to.be.true;

    const closeEvent = oneEvent(el, 'modal-close');
    el.close();
    await elementUpdated(el);

    expect(el.isOpen).to.be.false;
    expect(el).not.to.have.attribute('isOpen');
    // Check if backdrop is removed or just hidden by styles
    expect(el.shadowRoot.querySelector('.backdrop')).to.not.exist; 
    expect(await closeEvent).to.be.ok; // Check event was dispatched
  });

  it('should close when backdrop is clicked', async () => {
    const el = await fixture(html`<base-modal .isOpen=${true}></base-modal>`);
    expect(el.isOpen).to.be.true;

    const closeEvent = oneEvent(el, 'modal-close');
    const backdrop = el.shadowRoot.querySelector('.backdrop');
    backdrop.click();
    await elementUpdated(el);

    expect(el.isOpen).to.be.false;
    expect(await closeEvent).to.be.ok;
  });

  it('should not close when dialog content is clicked', async () => {
    const el = await fixture(html`<base-modal .isOpen=${true}><div>Content</div></base-modal>`);
    expect(el.isOpen).to.be.true;
    const closeSpy = sinon.spy();
    el.addEventListener('modal-close', closeSpy);

    const dialog = el.shadowRoot.querySelector('.dialog');
    // Use dispatchEvent for more control and check stopPropagation
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = sinon.spy(clickEvent, 'stopPropagation');
    dialog.dispatchEvent(clickEvent);
    await elementUpdated(el);

    expect(el.isOpen).to.be.true;
    expect(closeSpy).not.to.have.been.called;
    expect(stopPropagationSpy).to.have.been.called; // Verify stopPropagation was called
  });

  // Testing Escape key requires the element to be in the main DOM
  it('should close when Escape key is pressed', async () => {
    const el = await fixture(html`<div><base-modal .isOpen=${true}></base-modal></div>`);
    const modal = el.querySelector('base-modal');
    
    // Ensure modal is considered focused for key events
    modal.focus(); 
    
    const closeEvent = oneEvent(modal, 'modal-close');

    await sendKeys({ press: 'Escape' });
    await elementUpdated(modal);

    expect(modal.isOpen).to.be.false;
    expect(await closeEvent).to.be.ok;
  });

  it('should display the title when provided', async () => {
    const titleText = 'Test Modal Title';
    const el = await fixture(html`<base-modal .isOpen=${true} .title=${titleText}></base-modal>`);
    const titleElement = el.shadowRoot.querySelector('#dialog-title');
    expect(titleElement).to.exist;
    expect(titleElement.textContent).to.equal(titleText);
  });

  it('should render default slot content', async () => {
    const el = await fixture(html`
      <base-modal .isOpen=${true}>
        <p>Default slot content</p>
      </base-modal>
    `);
    const slotContent = el.querySelector('p');
    expect(slotContent).to.exist;
    expect(slotContent.textContent).to.equal('Default slot content');
    // Check if it's assigned to the default slot
    const defaultSlot = el.shadowRoot.querySelector('.dialog-content slot:not([name])');
    // Use assignedElements() to ignore whitespace text nodes
    expect(defaultSlot.assignedElements()[0]).to.equal(slotContent);
  });

  it('should render footer slot content', async () => {
    const el = await fixture(html`
      <base-modal .isOpen=${true}>
        <button slot="footer">Footer Button</button>
      </base-modal>
    `);
    const footerButton = el.querySelector('button[slot="footer"]');
    expect(footerButton).to.exist;
    expect(footerButton.textContent).to.equal('Footer Button');
    // Check if it's assigned to the footer slot
    const footerSlot = el.shadowRoot.querySelector('slot[name="footer"]');
    // Use assignedElements() for consistency
    expect(footerSlot.assignedElements()[0]).to.equal(footerButton);
  });

  it('should add and remove keydown listener when opening/closing', async () => {
    const addSpy = sinon.spy(window, 'addEventListener');
    const removeSpy = sinon.spy(window, 'removeEventListener');

    const el = await fixture(html`<base-modal></base-modal>`);
    
    // Open
    el.open();
    await elementUpdated(el);
    expect(addSpy).to.have.been.calledWith('keydown', el._boundHandleKeydown);
    addSpy.resetHistory(); // Reset spy for the next check

    // Close
    el.close();
    await elementUpdated(el);
    expect(removeSpy).to.have.been.calledWith('keydown', el._boundHandleKeydown);

    // Restore spies
    addSpy.restore();
    removeSpy.restore();
  });
}); 