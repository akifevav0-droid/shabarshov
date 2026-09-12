// Появление блоков, тень шапки при прокрутке, подсветка активного раздела, год в подвале.
(function () {
  var items = document.querySelectorAll('.reveal');
  function showAll() { items.forEach(function (el) { el.classList.add('is-visible'); }); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 2000); // страховка: через две секунды видно всё
  } else {
    showAll();
  }

  var nav = document.querySelector('.nav');
  var links = document.querySelectorAll('.nav__links a');
  var sections = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ a: a, s: s });
  });
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var y = window.scrollY + 120, current = null;
    sections.forEach(function (x) { if (x.s.offsetTop <= y) current = x; });
    sections.forEach(function (x) { x.a.classList.toggle('is-active', x === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
