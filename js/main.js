/* ── Hamburger Menu ── */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Hero Carousel ── */
const slides  = document.querySelectorAll('.carousel-slide');
const dots    = document.querySelectorAll('.carousel-dot');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
let currentSlide = 0;
let carouselTimer = null;

function goToSlide(n) {
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  slides[currentSlide].setAttribute('aria-hidden', 'true');
  if (dots[currentSlide]) { dots[currentSlide].classList.remove('active'); dots[currentSlide].setAttribute('aria-selected', 'false'); }
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  slides[currentSlide].setAttribute('aria-hidden', 'false');
  if (dots[currentSlide]) { dots[currentSlide].classList.add('active'); dots[currentSlide].setAttribute('aria-selected', 'true'); }
}

function startTimer() { carouselTimer = setInterval(() => goToSlide(currentSlide + 1), 6000); }
function resetTimer()  { clearInterval(carouselTimer); startTimer(); }

if (slides.length) {
  startTimer();
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetTimer(); }));
  prevBtn && prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetTimer(); });
  nextBtn && nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetTimer(); });

  const carousel = document.querySelector('.carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(carouselTimer));
    carousel.addEventListener('mouseleave', startTimer);

    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 50) { delta < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1); resetTimer(); }
    }, { passive: true });
  }
}

/* ── Event Filter ── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const eventCards  = document.querySelectorAll('.event-card');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      eventCards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ── Event Card Expand ── */
document.querySelectorAll('.event-card').forEach(function(card) {
  card.addEventListener('click', function(e) {
    if (e.target.closest('a') || e.target.closest('.btn')) return;
    const expanded = card.classList.toggle('expanded');
    const toggle = card.querySelector('.event-card-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
  });
});

/* ── Fade Up on Scroll ── */
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver(
  (entries) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }),
  { rootMargin: '0px 0px -50px 0px', threshold: 0.12 }
);
fadeEls.forEach(el => observer.observe(el));

/* ── Availability Calendar ── */
// Add or remove dates here to mark them as booked. Format: 'YYYY-MM-DD'
const BOOKED_DATES = [
  '2026-06-07',
  '2026-06-14',
  '2026-06-21',
  '2026-07-04',
];

(function () {
  const calDaysEl  = document.getElementById('calDays');
  const monthLabel = document.querySelector('.cal-month-label');
  const prevBtn    = document.querySelector('.cal-prev');
  const nextBtn    = document.querySelector('.cal-next');
  if (!calDaysEl) return;

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const today  = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  function pad(n) { return String(n).padStart(2, '0'); }

  function render(year, month) {
    monthLabel.textContent = `${MONTHS[month]} ${year}`;
    calDaysEl.innerHTML = '';

    const todayStr  = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    const firstDay  = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-cell cal-empty';
      calDaysEl.appendChild(blank);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr  = `${year}-${pad(month+1)}-${pad(d)}`;
      const isPast   = dateStr < todayStr;
      const isToday  = dateStr === todayStr;
      const isBooked = BOOKED_DATES.includes(dateStr);

      const cell = document.createElement('div');
      cell.className = 'cal-cell';
      cell.textContent = d;

      if (isPast) {
        cell.classList.add('cal-past');
      } else if (isBooked) {
        cell.classList.add('cal-booked');
        cell.setAttribute('title', 'Already booked');
      } else {
        cell.classList.add('cal-available');
        cell.setAttribute('title', `Select ${MONTHS[month]} ${d}`);
        cell.addEventListener('click', () => pickDate(dateStr, cell));
      }

      if (isToday) cell.classList.add('cal-today');
      calDaysEl.appendChild(cell);
    }
  }

  function pickDate(dateStr, cell) {
    calDaysEl.querySelectorAll('.cal-selected').forEach(el => el.classList.remove('cal-selected'));
    cell.classList.add('cal-selected');
    const input = document.getElementById('b_date');
    if (input) {
      input.value = dateStr;
      setTimeout(() => {
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }

  prevBtn.addEventListener('click', () => {
    if (--viewMonth < 0) { viewMonth = 11; viewYear--; }
    if (viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < today.getMonth())) {
      viewMonth = today.getMonth();
      viewYear  = today.getFullYear();
    }
    render(viewYear, viewMonth);
  });

  nextBtn.addEventListener('click', () => {
    if (++viewMonth > 11) { viewMonth = 0; viewYear++; }
    render(viewYear, viewMonth);
  });

  render(viewYear, viewMonth);
})();

/* ── Sticky nav shadow on scroll ── */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}
