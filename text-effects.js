/* text-effects.js — splits text into letters / words and plays the effects
   in text-effects.css when each piece of text comes into view. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var vh = window.innerHeight;
  function inFirstScreen(el) { return el.getBoundingClientRect().top < vh * 0.9; }

  /* play an element now, or when it scrolls into view */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      play(e.target._teFor || e.target);
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }) : null;

  function play(el) {
    el.classList.remove('wait');
    void el.offsetWidth;
    el.classList.add('play');
  }
  /* trigger: the element whose visibility starts the effect (a clipped element
     cannot be observed directly, so labels watch their parent) */
  function watch(el, trigger) {
    var t = trigger || el;
    if (!io || inFirstScreen(t)) { requestAnimationFrame(function () { play(el); }); return; }
    el.classList.add('wait');
    if (t !== el) { var proxy = t; if (proxy._teFor) { proxy = el.parentElement; } proxy._teFor = el; io.observe(proxy); }
    else io.observe(el);
  }

  /* 1. Name: one span per letter */
  var h1 = document.querySelector('.hero h1');
  if (h1) {
    var name = h1.textContent;
    h1.setAttribute('aria-label', name);
    h1.textContent = '';
    var box = document.createElement('span');
    box.className = 'te-letters';
    box.setAttribute('aria-hidden', 'true');
    var idx = 0;
    name.split(' ').forEach(function (word, wi, all) {
      var wd = document.createElement('span');
      wd.className = 'wd';
      for (var j = 0; j < word.length; j++) {
        var c = document.createElement('span');
        c.className = 'ch';
        c.style.setProperty('--i', idx++);
        c.textContent = word[j];
        wd.appendChild(c);
      }
      box.appendChild(wd);
      if (wi < all.length - 1) { box.appendChild(document.createTextNode(' ')); idx++; }
    });
    h1.appendChild(box);
    h1.style.animation = 'none';
    requestAnimationFrame(function () { box.classList.add('play'); });

  }

  /* 2. Section headings: one masked span per word */
  document.querySelectorAll('.sec-head h2, .explorer .ex-top h3').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = w;
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    h.classList.add('te-words');
    watch(h);
  });

  /* 3. Eyebrow labels */
  document.querySelectorAll('.eyebrow').forEach(function (e) {
    e.classList.add('te-wipe');
    watch(e, e.parentElement);
  });

  /* 4. Highlighter marks: stagger the ones that share a paragraph */
  document.querySelectorAll('mark.hl').forEach(function (m) {
    var sibs = m.parentElement.querySelectorAll('mark.hl');
    var k = Array.prototype.indexOf.call(sibs, m);
    m.style.setProperty('--d', (600 + k * 260) + 'ms');
    watch(m);
  });

  /* 5. Glint over the big numbers once their count-up finishes */
  document.querySelectorAll('.stat b').forEach(function (b, i) {
    setTimeout(function () { b.classList.add('te-glint'); }, 1500 + i * 150);
  });
})();
