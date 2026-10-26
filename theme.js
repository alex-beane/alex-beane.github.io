/* Theme toggle: light by default, remembers the visitor's choice on every page.
   Loaded in <head> so the saved theme applies before the page paints (no flash).

   The choice is saved in two places, each stamped with the time it was set:
     1. localStorage  - remembered across visits (shared by all pages on the site)
     2. window.name   - follows the browser tab from page to page, which keeps
                        the theme in sync even when a browser gives every page
                        its own separate storage (e.g. opening the .html files
                        directly from a folder in Safari)
   On load, whichever copy is newest wins. */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;

  function parse(s) {
    if (!s) return null;
    var p = String(s).split('|');
    if (p[0] !== 'dark' && p[0] !== 'light') return null;
    return { v: p[0], t: +p[1] || 0 };
  }
  function fromStore() {
    try { return parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function fromName() {
    var m = /(?:^|;)theme=([^;]*)/.exec(window.name || '');
    return m ? parse(m[1]) : null;
  }
  function newest() {
    var a = fromStore(), b = fromName();
    if (a && b) return a.t >= b.t ? a : b;
    return a || b;
  }
  function save(value) {
    var rec = value + '|' + Date.now();
    try { localStorage.setItem(KEY, rec); } catch (e) { /* storage blocked: fine */ }
    var rest = (window.name || '').replace(/(?:^|;)theme=[^;]*/, '').replace(/^;/, '');
    window.name = 'theme=' + rec + (rest ? ';' + rest : '');
  }
  function apply(value) {
    root.setAttribute('data-theme', value === 'dark' ? 'dark' : 'light');
  }
  function refresh() {
    var n = newest();
    apply(n ? n.v : 'light');
  }

  refresh();

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    sync();

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      save(next);
      sync();
    });

    // Back/forward button restoring a cached page, or another open tab changing the theme
    window.addEventListener('pageshow', function () { refresh(); sync(); });
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { refresh(); sync(); }
    });
  });
})();