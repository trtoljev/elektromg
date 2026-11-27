/* =========================================================
   ELEKTRO MG — interactions
   ========================================================= */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('main-nav');
  var navToggle = document.querySelector('.nav-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header state ---------- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Odpri meni');
    document.body.style.removeProperty('overflow');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.removeProperty('overflow');
      }
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Scroll spy ---------- */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var spySections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = id ? document.getElementById(id) : null;
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spySections.forEach(function (item) {
          item.link.classList.toggle('is-active', item.el === entry.target);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spySections.forEach(function (item) { spy.observe(item.el); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children).filter(function (c) {
          return c.classList.contains('reveal');
        }) : [];
        var index = siblings.indexOf(el);
        if (index > 0) {
          el.style.transitionDelay = Math.min(index * 70, 350) + 'ms';
        }
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Gallery lightbox ---------- */
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');

  if (gallery && lightbox) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('.gallery-item'));
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('figcaption');
    var btnClose = lightbox.querySelector('.lightbox-close');
    var btnPrev = lightbox.querySelector('.lightbox-prev');
    var btnNext = lightbox.querySelector('.lightbox-next');
    var current = 0;
    var lastFocused = null;

    function show(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      var full = item.getAttribute('data-full');
      var caption = item.getAttribute('data-caption') || '';
      lbImg.src = full;
      lbImg.alt = item.querySelector('img') ? item.querySelector('img').alt : caption;
      lbCap.textContent = caption;
    }

    function openLightbox(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.removeProperty('overflow');
      lbImg.removeAttribute('src');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function () { openLightbox(index); });
    });

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'Tab') {
        e.preventDefault();
        var focusables = [btnClose, btnPrev, btnNext];
        var idx = focusables.indexOf(document.activeElement);
        var next = e.shiftKey ? idx - 1 : idx + 1;
        focusables[(next + focusables.length) % focusables.length].focus();
      }
    });
  }

  /* ---------- Year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Contact form (mailto) ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var ime = (data.get('ime') || '').toString().trim();
      var telefon = (data.get('telefon') || '').toString().trim();
      var eposta = (data.get('eposta') || '').toString().trim();
      var projekt = (data.get('projekt') || '').toString().trim();
      var sporocilo = (data.get('sporocilo') || '').toString().trim();

      var subject = 'Povpraševanje s spletne strani' + (ime ? ' – ' + ime : '');
      var body = [
        'Ime in priimek: ' + ime,
        'Telefon: ' + telefon,
        'E-pošta: ' + eposta,
        'Vrsta projekta: ' + (projekt || 'ni izbrano'),
        '',
        'Sporočilo:',
        sporocilo
      ].join('\n');

      window.location.href = 'mailto:mikulic.goran@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      if (status) {
        status.textContent = 'Odprli smo vaš e-poštni program. Če se ne odpre, pišite na mikulic.goran@gmail.com.';
      }
    });
  }

  /* ---------- Smooth Scroll Fixes ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      
      var target = document.querySelector(id);
      if (target || id === '#vrh') {
        e.preventDefault();
        
        var top = 0;
        if (id !== '#vrh' && target) {
          top = target.offsetTop - (header ? header.offsetHeight : 0);
        }

        window.scrollTo({
          top: top,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
        
        if (id !== '#vrh') {
          history.pushState(null, null, id);
        } else {
          history.pushState(null, null, window.location.pathname);
        }
      }
    });
  });

  /* ---------- Cookie Banner ---------- */
  var banner = document.getElementById('cookie-banner');
  var acceptBtn = document.getElementById('cookie-accept');

  if (banner && acceptBtn) {
    if (!localStorage.getItem('cookies-accepted')) {
      banner.hidden = false;
    }

    acceptBtn.addEventListener('click', function () {
      localStorage.setItem('cookies-accepted', 'true');
      banner.hidden = true;
    });
  }
})();
