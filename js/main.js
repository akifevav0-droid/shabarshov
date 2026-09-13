// Ступенчатое появление, активный раздел в шапке, панель записи на телефоне, год.
(function () {
  var items = document.querySelectorAll('.rv');
  function showAll() { items.forEach(function (el) { el.classList.add('on'); }); }
  if ('IntersectionObserver' in window) {
    var queue = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, delay = (queue++ % 6) * 70;
        setTimeout(function () { el.classList.add('on'); }, delay);
        setTimeout(function () { queue = Math.max(0, queue - 1); }, 400);
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 2500);
  } else { showAll(); }

  var links = document.querySelectorAll('.nav__links a');
  var sections = [];
  links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) sections.push({ a: a, s: s }); });
  var dock = document.querySelector('.dock'), hero = document.querySelector('.hero'), zapis = document.getElementById('zapis');
  function onScroll() {
    var y = window.scrollY;
    if (dock && hero && zapis) {
      var past = y > hero.offsetTop + hero.offsetHeight - 60;
      var before = y + window.innerHeight < zapis.offsetTop + 40;
      dock.classList.toggle('on', past && before);
    }
    var cur = null;
    sections.forEach(function (x) { if (x.s.offsetTop <= y + 100) cur = x; });
    sections.forEach(function (x) { x.a.classList.toggle('on', x === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
