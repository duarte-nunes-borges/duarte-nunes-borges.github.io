(function () {
  document.documentElement.classList.add('js');
  var body = document.body;
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- Start each new page at the top (back/forward keeps the browser's own position) ----
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (!location.hash && (!nav || nav.type !== 'back_forward')) window.scrollTo(0, 0);
  } catch (e) {}

  // ---- Videos play only while they are on screen ----
  var vids = $('video[data-autoplay]');
  if (vids.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.currentTime = v.dataset.started ? v.currentTime : 0; v.dataset.started = '1'; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.5 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  // ---- Side navigation: shows which project chapter is on screen ----
  var chapnav = document.querySelector('.chapnav');
  var chapters = $('.chapter');
  if (chapnav && chapters.length && 'IntersectionObserver' in window) {
    var inView = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { inView[e.target.id] = e.isIntersecting; });
      var current = chapters.filter(function (c) { return inView[c.id]; })[0];
      chapnav.classList.toggle('show', !!current);
      $('a', chapnav).forEach(function (a) { a.classList.toggle('on', !!current && a.getAttribute('href') === '#' + current.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    chapters.forEach(function (c) { io.observe(c); });
  }

  // ---- Chapter select ----
  var select = document.querySelector('.select');
  var panels = select ? $('.panel', select) : [];
  function openPanel(p) {
    panels.forEach(function (x) { x.classList.toggle('on', x === p); });
  }
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { openPanel(p); });
    p.addEventListener('focus', function () { openPanel(p); });
  });

  // ---- "I'm hiring for…" switch ----
  var roleBtns = $('.roles-btns button');
  var pitch = document.querySelector('.role-pitch');
  function chooseRole(btn) {
    roleBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    var role = btn.getAttribute('data-role');
    var tpl = document.getElementById('pitch-' + role);
    if (pitch && tpl) pitch.innerHTML = tpl.innerHTML;
    var match = (btn.getAttribute('data-projects') || '').split(' ');
    if (select) {
      select.classList.add('filtered');
      panels.forEach(function (p) { p.classList.toggle('match', match.indexOf(p.getAttribute('data-p')) > -1); });
      var first = panels.filter(function (p) { return p.getAttribute('data-p') === match[0]; })[0];
      if (first) openPanel(first);
    }
  }
  roleBtns.forEach(function (b) { b.addEventListener('click', function () { chooseRole(b); }); });

  // ---- Copy e-mail ----
  $('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { var s = b.parentNode.querySelector('.copied'); if (s) s.textContent = 'Address copied'; };
      try { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(done, function () {}); } catch (e) {}
    });
  });

  // ---- Lightbox ----
  var triggers = $('[data-full]');
  if (!triggers.length) return;
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image viewer');
  lb.innerHTML = '<button class="lb-close" type="button">Close</button><div class="lb-stage"><img alt=""></div>' +
    '<div class="lb-bar"><button class="lb-prev" type="button">Previous</button><span class="lb-cap"></span><button class="lb-next" type="button">Next</button></div>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), stage = lb.querySelector('.lb-stage');
  var group = [], index = 0, opener = null;
  function show(i) {
    index = (i + group.length) % group.length;
    var t = group[index];
    img.src = t.getAttribute('data-full');
    img.alt = t.getAttribute('data-cap') || '';
    cap.textContent = (t.getAttribute('data-cap') || '') + (group.length > 1 ? '  (' + (index + 1) + ' of ' + group.length + ')' : '');
    lb.classList.toggle('tall', t.hasAttribute('data-tall'));
    stage.scrollTop = 0;
    lb.querySelector('.lb-prev').hidden = lb.querySelector('.lb-next').hidden = group.length < 2;
  }
  function openLb(t) {
    var g = t.getAttribute('data-group');
    group = triggers.filter(function (x) { return x.getAttribute('data-group') === g; });
    opener = t; show(group.indexOf(t));
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; img.removeAttribute('src'); if (opener) opener.focus(); }
  triggers.forEach(function (t) { t.addEventListener('click', function () { openLb(t); }); });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(index - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(index + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
