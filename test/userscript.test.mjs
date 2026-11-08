import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const code = readFileSync(new URL('../notion-native-translate-unlock.user.js', import.meta.url), 'utf8');

class FakeElement {
  constructor(localName, attributes = {}, children = []) {
    this.localName = localName;
    this.attributes = new Map(Object.entries(attributes));
    this.children = children;
    this.parent = null;
    this.writes = 0;
    for (const child of children) child.parent = this;
    this.classList = {
      contains: value => (this.attributes.get('class') || '').split(/\s+/).includes(value),
      remove: value => {
        const before = this.attributes.get('class') || '';
        const after = before.split(/\s+/).filter(item => item && item !== value).join(' ');
        if (before !== after) this.setAttribute('class', after);
      },
    };
  }

  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, value); this.writes++; }
  removeAttribute(name) { if (this.attributes.delete(name)) this.writes++; }
  remove() {
    if (!this.parent) return;
    this.parent.children.splice(this.parent.children.indexOf(this), 1);
    this.parent = null;
    this.writes++;
  }
  querySelectorAll() {
    const result = [];
    const visit = element => {
      for (const child of element.children) {
        if (child.classList.contains('notranslate') ||
            child.getAttribute('translate')?.toLowerCase() === 'no' ||
            (child.localName === 'meta' && child.getAttribute('name')?.toLowerCase() === 'google')) {
          result.push(child);
        }
        visit(child);
      }
    };
    visit(this);
    return result;
  }
  append(child) { child.parent = this; this.children.push(child); }
}

function start(root) {
  let observer;
  class FakeObserver {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(target, options) { this.target = target; this.options = options; }
  }
  runInNewContext(code, {
    document: { documentElement: root },
    Element: FakeElement,
    MutationObserver: FakeObserver,
  });
  return observer;
}

test('initial scan removes opt-outs and preserves other settings', () => {
  const meta = new FakeElement('meta', { name: 'Google', content: 'nositelinkssearchbox, NOTRANSLATE' });
  const block = new FakeElement('div', { class: 'notranslate other', translate: 'NO' });
  const unrelated = new FakeElement('meta', { name: 'viewport', content: 'notranslate' });
  const root = new FakeElement('html', { translate: 'no' }, [meta, block, unrelated]);
  const observer = start(root);

  assert.equal(root.getAttribute('translate'), null);
  assert.equal(block.getAttribute('class'), 'other');
  assert.equal(block.getAttribute('translate'), null);
  assert.equal(meta.getAttribute('content'), 'nositelinkssearchbox');
  assert.equal(unrelated.getAttribute('content'), 'notranslate');
  assert.deepEqual(Array.from(observer.options.attributeFilter), ['class', 'translate', 'name', 'content']);
});

test('dynamic nodes and reapplied attributes are unlocked', () => {
  const root = new FakeElement('html');
  const observer = start(root);
  const nested = new FakeElement('span', { class: 'notranslate' });
  const added = new FakeElement('div', {}, [nested]);
  root.append(added);
  observer.callback([{ type: 'childList', addedNodes: [added] }]);
  assert.equal(nested.getAttribute('class'), '');

  nested.setAttribute('translate', 'no');
  observer.callback([{ type: 'attributes', target: nested }]);
  assert.equal(nested.getAttribute('translate'), null);

  const meta = new FakeElement('meta', { name: 'google', content: 'notranslate' });
  root.append(meta);
  observer.callback([{ type: 'childList', addedNodes: [meta] }]);
  assert.equal(meta.parent, null);
});

test('repeated scans do not keep changing the DOM', () => {
  const block = new FakeElement('div', { class: 'notranslate' });
  const root = new FakeElement('html', {}, [block]);
  const observer = start(root);
  const writes = block.writes;
  observer.callback([{ type: 'attributes', target: block }]);
  observer.callback([{ type: 'childList', addedNodes: [block] }]);
  assert.equal(block.writes, writes);
});
