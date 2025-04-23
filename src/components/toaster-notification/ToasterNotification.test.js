import { html, fixture, expect, elementUpdated, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import './ToasterNotification.js';
describe('ToasterNotification', () => {
  let clock;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    clock.restore();
  });
  it('should not be visible initially', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    expect(el).to.not.have.attribute('visible');
    const styles = getComputedStyle(el);
    expect(styles.opacity).to.equal('0');
  });
  it('should become visible when show() is called with success type', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    el.show('Test Success', 'success');
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    const styles = getComputedStyle(el);
    const toastDiv = el.shadowRoot.querySelector('.toast');
    expect(toastDiv).to.exist;
    expect(toastDiv).to.have.class('success');
    expect(toastDiv.textContent).to.contain('Test Success');
    const iconSvg = el.shadowRoot.querySelector('.icon svg');
    expect(iconSvg).to.exist;
    expect(iconSvg.innerHTML).to.contain('M9 12.75L11.25 15 15 9.75'); 
  });
  it('should become visible when show() is called with error type', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    el.show('Test Error', 'error');
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    const toastDiv = el.shadowRoot.querySelector('.toast');
    expect(toastDiv).to.exist;
    expect(toastDiv).to.have.class('error');
    expect(toastDiv.textContent).to.contain('Test Error');
    const iconSvg = el.shadowRoot.querySelector('.icon svg');
    expect(iconSvg).to.exist;
    expect(iconSvg.innerHTML).to.contain('M12 9v3.75m9-.75a9'); 
  });
  it('should auto-hide after the default duration', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    el.show('Auto Hide Test', 'success');
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    clock.tick(3000);
    await elementUpdated(el); 
    await waitUntil(() => !el.hasAttribute('visible'), 'Element did not hide after duration');
    expect(el).to.not.have.attribute('visible');
  });
  it('should auto-hide after a custom duration', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    const customDuration = 1000;
    el.show('Custom Duration Test', 'success', customDuration);
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    clock.tick(customDuration - 1);
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    clock.tick(1);
    await elementUpdated(el);
    await waitUntil(() => !el.hasAttribute('visible'), 'Element did not hide after custom duration');
    expect(el).to.not.have.attribute('visible');
  });
   it('should clear existing timer if show() is called again', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    el.show('First message', 'success', 3000);
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    clock.tick(1500);
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    el.show('Second message', 'error', 3000);
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    expect(el.shadowRoot.querySelector('.toast').textContent).to.contain('Second message');
    expect(el.shadowRoot.querySelector('.toast')).to.have.class('error');
    clock.tick(2000); 
    await elementUpdated(el);
    expect(el).to.have.attribute('visible'); 
    clock.tick(1000);
    await elementUpdated(el);
    await waitUntil(() => !el.hasAttribute('visible'), 'Element did not hide after second show call');
    expect(el).to.not.have.attribute('visible');
  });
  it('should not render an icon if type is invalid', async () => {
    const el = await fixture(html`<toaster-notification></toaster-notification>`);
    el.show('No Icon Test', 'invalid-type'); 
    await elementUpdated(el);
    expect(el).to.have.attribute('visible');
    const toastDiv = el.shadowRoot.querySelector('.toast');
    expect(toastDiv).to.exist;
    expect(toastDiv.textContent).to.contain('No Icon Test');
    const iconSpan = el.shadowRoot.querySelector('.icon');
    expect(iconSpan).to.exist;
    expect(iconSpan.children.length).to.equal(0);
  });
});