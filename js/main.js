// Появление блоков при прокрутке + текущий год в подвале.
(function () {
  var items = document.querySelectorAll('.reveal');
  function showAll() { items.forEach(function (el) { el.classList.add('is-visible'); }); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    // Страховка: что бы ни случилось, через две секунды всё видно.
    setTimeout(showAll, 2000);
  } else {
    showAll();
  }
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
