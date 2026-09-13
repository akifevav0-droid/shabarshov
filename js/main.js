// Появление блоков, тень шапки, активный раздел в меню, панель записи на телефоне, год в подвале.
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
  var dock = document.querySelector('.dock');
  var hero = document.querySelector('.hero');
  var zapis = document.getElementById('zapis');
  var links = document.querySelectorAll('.nav__links a');
  var sections = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ a: a, s: s });
  });
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    // Панель записи: после главного экрана и до блока записи
    if (dock && hero && zapis) {
      var pastHero = y > hero.offsetTop + hero.offsetHeight - 80;
      var beforeZapis = y + window.innerHeight < zapis.offsetTop + 40;
      dock.classList.toggle('is-visible', pastHero && beforeZapis);
    }
    var cur = null;
    sections.forEach(function (x) { if (x.s.offsetTop <= y + 120) cur = x; });
    sections.forEach(function (x) { x.a.classList.toggle('is-active', x === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
