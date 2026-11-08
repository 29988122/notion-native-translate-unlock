// ==UserScript==
// @name         Notion Native Translate Unlock
// @name:zh-TW   Notion 原生翻譯解鎖
// @namespace    https://github.com/29988122/notion-native-translate-unlock
// @version      1.0.0
// @description  Remove Notion translation opt-out markers for browser translation.
// @description:zh-TW 移除 Notion 的禁止翻譯標記，讓瀏覽器內建翻譯有機會處理頁面。
// @author       29988122
// @license      MIT
// @match        https://notion.site/*
// @match        https://*.notion.site/*
// @match        https://notion.so/*
// @match        https://*.notion.so/*
// @match        https://notion.com/*
// @match        https://*.notion.com/*
// @homepageURL  https://github.com/29988122/notion-native-translate-unlock
// @source       https://github.com/29988122/notion-native-translate-unlock
// @supportURL   https://github.com/29988122/notion-native-translate-unlock/issues
// @updateURL    https://raw.githubusercontent.com/29988122/notion-native-translate-unlock/main/notion-native-translate-unlock.user.js
// @downloadURL  https://raw.githubusercontent.com/29988122/notion-native-translate-unlock/main/notion-native-translate-unlock.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const selector = '.notranslate, [translate="no" i], meta[name="google" i]';

  function unlock(element) {
    if (!(element instanceof Element)) return;

    if (element.classList.contains('notranslate')) {
      element.classList.remove('notranslate');
    }

    if (element.getAttribute('translate')?.trim().toLowerCase() === 'no') {
      element.removeAttribute('translate');
    }

    if (element.localName !== 'meta' ||
        element.getAttribute('name')?.trim().toLowerCase() !== 'google') return;

    const content = element.getAttribute('content');
    if (content == null) return;

    const settings = content.split(',').map(value => value.trim()).filter(Boolean);
    const remaining = settings.filter(value => value.toLowerCase() !== 'notranslate');
    if (remaining.length === settings.length) return;

    if (remaining.length === 0) {
      element.remove();
    } else {
      element.setAttribute('content', remaining.join(', '));
    }
  }

  function scan(root) {
    if (!(root instanceof Element)) return;
    unlock(root);
    root.querySelectorAll(selector).forEach(unlock);
  }

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        unlock(record.target);
      } else {
        record.addedNodes.forEach(scan);
      }
    }
  });

  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', 'translate', 'name', 'content'],
  });

  scan(document.documentElement);
})();
