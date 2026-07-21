// ─── i18n ─────────────────────────────────────────────────────────────────────
// One translation layer for every page. Pages register their own strings and
// listen for 'i18n:change'; detection, persistence and the toggle live here.
//
// Load this BEFORE any page script:
//   <script src="js/i18n.js"></script>
//
// Usage:
//   I18n.register({ de: {...}, en: {...} });   // merges into the store
//   I18n.vars({ age: 22 });                    // {age} placeholders
//   I18n.t('hero.badge');
//   I18n.set('en');                            // persists + re-applies
//   document.addEventListener('i18n:change', e => render(e.detail.lang));
//
// Markup:
//   <span data-key="nav.about">…</span>
//   <input data-key="search.ph" data-key-attr="placeholder">
//   <a data-key="cta" data-key-attr="title,aria-label">…</a>

(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'lang';
  var SUPPORTED   = ['de', 'en'];
  var FALLBACK    = 'de';

  var store = { de: {}, en: {} };
  var vars  = {};
  var current;

  // ─── Detection ──────────────────────────────────────────────────────────────
  // Priority: ?lang= override → stored choice → browser Accept-Language.
  // No cookies; navigator.language rides along on every request anyway.
  function detect() {
    var q;
    try { q = new URLSearchParams(window.location.search).get(STORAGE_KEY); } catch (e) { q = null; }
    if (q && SUPPORTED.indexOf(q) !== -1) return q;

    var stored = read();
    if (stored) return stored;

    var nav = (navigator.language || navigator.userLanguage || FALLBACK).toLowerCase();
    return nav.indexOf('de') === 0 ? 'de' : 'en';
  }

  // localStorage throws in private mode on some browsers; never let that break
  // the page, just fall back to a non-persistent choice.
  function read() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.indexOf(v) !== -1 ? v : null;
    } catch (e) { return null; }
  }

  function write(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  // ─── Store ──────────────────────────────────────────────────────────────────
  function register(dict) {
    SUPPORTED.forEach(function (lang) {
      if (!dict[lang]) return;
      Object.keys(dict[lang]).forEach(function (key) { store[lang][key] = dict[lang][key]; });
    });
    if (ready) apply();          // late registration still paints
    return I18n;
  }

  function setVars(next) {
    Object.keys(next).forEach(function (k) { vars[k] = next[k]; });
    if (ready) apply();
    return I18n;
  }

  function interpolate(str) {
    return String(str).replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match;
    });
  }

  // Falls back to the other language before giving up, so a key that only
  // exists in German still renders something in English instead of blanking.
  function t(key, lang) {
    var l = lang || current;
    var v = store[l] && store[l][key];
    if (v === undefined) {
      var other = l === 'de' ? 'en' : 'de';
      v = store[other] && store[other][key];
    }
    return v === undefined ? undefined : interpolate(v);
  }

  // ─── Apply ──────────────────────────────────────────────────────────────────
  // Entities (&amp;) and inline markup need innerHTML; plain strings use
  // textContent so stray angle brackets in prose stay literal.
  var NEEDS_HTML = /<[a-z!/][\s\S]*>|&[a-zA-Z#][a-zA-Z0-9]*;/;

  function paint(el, value) {
    if (NEEDS_HTML.test(value)) el.innerHTML = value;
    else el.textContent = value;
  }

  function apply() {
    document.documentElement.lang = current;

    document.querySelectorAll('[data-key]').forEach(function (el) {
      var value = t(el.getAttribute('data-key'));
      if (value === undefined) return;

      var attrs = el.getAttribute('data-key-attr');
      if (attrs) {
        attrs.split(',').forEach(function (name) {
          name = name.trim();
          if (name) el.setAttribute(name, value);
        });
      } else {
        paint(el, value);
      }
    });

    syncToggles();
  }

  // ─── Toggle ─────────────────────────────────────────────────────────────────
  // Historic pages use #lang-toggle, #lang-btn or [data-lang-toggle]; accept all
  // three so no page gets left behind. Label style is per-button: data-lang-label
  // ="name" shows the target language's name, anything else shows its code.
  function toggles() {
    return document.querySelectorAll('#lang-toggle, #lang-btn, [data-lang-toggle]');
  }

  function syncToggles() {
    var next = current === 'de' ? 'en' : 'de';
    toggles().forEach(function (btn) {
      btn.textContent = btn.getAttribute('data-lang-label') === 'name'
        ? (next === 'de' ? 'Deutsch' : 'English')
        : next.toUpperCase();
      btn.setAttribute('aria-label', next === 'de' ? 'Auf Deutsch umschalten' : 'Switch to English');
      btn.setAttribute('lang', next);
    });
  }

  function set(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = FALLBACK;
    current = lang;
    write(lang);
    apply();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: lang } }));
    return lang;
  }

  function toggle() {
    return set(current === 'de' ? 'en' : 'de');
  }

  // ─── Boot ───────────────────────────────────────────────────────────────────
  var ready = false;
  current = detect();
  document.documentElement.lang = current;   // before first paint, no flash

  function init() {
    ready = true;
    apply();
    // Delegated: works for toggles injected after load, and can't double-bind.
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('#lang-toggle, #lang-btn, [data-lang-toggle]');
      if (!btn) return;
      e.preventDefault();
      toggle();
    });
    // Another tab changed the language: follow it.
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue !== current) set(e.newValue);
    });
    document.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: current } }));
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: current } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  var I18n = {
    register: register,
    vars: setVars,
    t: t,
    set: set,
    toggle: toggle,
    apply: apply,
    get lang() { return current; },
    get supported() { return SUPPORTED.slice(); },
  };

  window.I18n = I18n;
})(window, document);
