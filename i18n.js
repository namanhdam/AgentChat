// Interface language. The Vietnamese text in the code is the key; locales/<lang>.js maps it to the translation.
// Placeholders are {name}; a translation given as [one, other] picks by vars.n. Missing keys fall back to Vietnamese.
// Loaded with require() in main/core and as a plain <script> in the renderer (after the locale scripts).
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory({ en: require('./locales/en'), ja: require('./locales/ja') })
  else root.i18n = factory(root.AGENT_CHAT_LOCALES || {})
})(typeof self !== 'undefined' ? self : this, function (dicts) {
  const LANGS = ['vi', 'en', 'ja']
  const NAMES = { vi: 'Tiếng Việt', en: 'English', ja: '日本語' }
  const LOCALES = { vi: 'vi-VN', en: 'en-US', ja: 'ja-JP' }
  let lang = 'vi'
  const fill = (s, vars) => vars ? s.replace(/\{(\w+)\}/g, (m, k) => Object.hasOwn(vars, k) ? String(vars[k]) : m) : s
  function t(key, vars) {
    let s = lang === 'vi' ? undefined : dicts[lang]?.[key]
    if (Array.isArray(s)) s = s[vars?.n === 1 ? 0 : 1]
    return fill(typeof s === 'string' ? s : key, vars)
  }
  // the system's preferred languages (BCP 47) → the first one the app has, else English
  const pick = list => (list || []).map(l => String(l).toLowerCase().split(/[-_]/)[0]).find(l => LANGS.includes(l)) || 'en'
  // the static text of index.html: text nodes and these attributes; data-keys (settings search) keeps the Vietnamese words too
  const ATTRS = ['title', 'aria-label', 'placeholder', 'alt']
  const norm = s => s.replace(/\s+/g, ' ').trim()
  function translateDom(root) {
    if (lang === 'vi') return
    const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */)
    for (let node; (node = walker.nextNode());) {
      if (node.parentElement?.closest('script, style')) continue
      const key = norm(node.nodeValue)
      if (key && dicts[lang]?.[key] != null) node.nodeValue = node.nodeValue.replace(/\S[\s\S]*\S|\S/, t(key))
    }
    for (const el of root.querySelectorAll('*')) {
      for (const a of ATTRS) if (el.hasAttribute(a)) { const key = norm(el.getAttribute(a)); if (key) el.setAttribute(a, t(key)) }
      if (el.dataset.keys) el.dataset.keys += ' ' + t(norm(el.dataset.keys))
    }
  }
  return {
    LANGS, NAMES, dicts, t, pick, norm, ATTRS, translateDom,
    lang: () => lang,
    setLang: next => { if (LANGS.includes(next)) lang = next; return lang },
    locale: () => LOCALES[lang],
  }
})
