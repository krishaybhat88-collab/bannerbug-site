/* ================================================================
   THE BANNER BUG — Main JavaScript
   GSAP + ScrollTrigger animations, hero carousel, 3D card tilt
   ================================================================ */

(function () {
  'use strict';

  /* ── Register GSAP plugins ── */
  gsap.registerPlugin(ScrollTrigger);

  /* ── Nav scroll class ── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── Mobile burger ── */
  const burger = document.querySelector('.nav__burger');
  const navLinks = document.querySelector('.nav__links');

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ================================================================
     HERO — entrance animations
     ================================================================ */
  const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTL
    .from('.hero__eyebrow', { y: 30, opacity: 0, duration: .7 })
    .from('.hero__title',   { y: 40, opacity: 0, duration: .8 }, '-=.3')
    .from('.hero__bug',     { scale: 0, rotation: -30, duration: .6, ease: 'back.out(2)' }, '-=.3')
    .from('.hero__sub',     { y: 25, opacity: 0, duration: .7 }, '-=.4')
    .from('.hero__cta',     { y: 20, opacity: 0, duration: .6 }, '-=.3')
    .from('.hero__ig',      { y: 15, opacity: 0, duration: .5 }, '-=.3')
    .from('.hero__stage',   { x: 60, opacity: 0, duration: 1, ease: 'power2.out' }, '-=1')
    .from('.hero__dots',    { opacity: 0, duration: .5 }, '-=.2');

  /* ── Floating deco elements ── */
  gsap.utils.toArray('.deco').forEach((el, i) => {
    gsap.from(el, {
      y: 20, opacity: 0, duration: .8,
      delay: 1 + i * .15,
      ease: 'power2.out'
    });
  });

  /* ── Hero bug bounce ── */
  gsap.to('.hero__bug', {
    y: -8,
    rotation: 10,
    duration: 1.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: 1.5
  });

  /* ── Hero carousel ScrollTrigger: 3D parallax scale ── */
  gsap.to('.hero__stage', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2
    },
    y: 60,
    scale: 1.06,
    rotateX: 4,
    ease: 'none'
  });

  gsap.to('.hero__copy', {
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: .8
    },
    y: -40,
    opacity: .4,
    ease: 'none'
  });

  /* ================================================================
     HERO CAROUSEL
     ================================================================ */
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const dots   = Array.from(document.querySelectorAll('.hero__dot'));
  let current  = 0;
  let autoTimer = null;

  function goToSlide(next, animate = true) {
    if (next === current) return;

    const outSlide = slides[current];
    const inSlide  = slides[next];

    if (animate) {
      gsap.to(outSlide, {
        opacity: 0,
        scale: .95,
        duration: .7,
        ease: 'power2.in',
        onComplete: () => outSlide.classList.remove('hero__slide--active')
      });
      gsap.fromTo(inSlide,
        { opacity: 0, scale: 1.04, zIndex: 1 },
        { opacity: 1, scale: 1,    zIndex: 1, duration: .8, ease: 'power2.out',
          onStart: () => inSlide.classList.add('hero__slide--active')
        }
      );
    } else {
      outSlide.classList.remove('hero__slide--active');
      inSlide.classList.add('hero__slide--active');
      gsap.set(inSlide, { opacity: 1, scale: 1 });
    }

    dots[current].classList.remove('hero__dot--active');
    dots[current].setAttribute('aria-selected', 'false');
    dots[next].classList.add('hero__dot--active');
    dots[next].setAttribute('aria-selected', 'true');

    current = next;
  }

  function nextSlide() {
    goToSlide((current + 1) % slides.length);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, 3500);
  }

  /* Dot clicks */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startAuto();
    });
  });

  /* Touch/swipe support */
  let touchStartX = 0;
  const carousel = document.getElementById('heroCarousel');
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      goToSlide(dx < 0
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length
      );
      startAuto();
    }
  });

  /* Pause on hover */
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', startAuto);

  startAuto();

  /* ================================================================
     GALLERY — stagger float-up + 3D tilt
     ================================================================ */
  gsap.utils.toArray('[data-gallery-card]').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none reverse'
      },
      y: 0,
      opacity: 1,
      duration: .8,
      delay: i * .12,
      ease: 'power3.out'
    });

    /* 3D tilt on hover */
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateY:  dx * 10,
        rotateX: -dy * 8,
        scale: 1.03,
        boxShadow: '0 20px 48px rgba(0,0,0,.18)',
        duration: .35,
        ease: 'power2.out',
        transformPerspective: 900
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0, scale: 1,
        boxShadow: '0 4px 16px rgba(0,0,0,.08)',
        duration: .6,
        ease: 'elastic.out(1,.6)'
      });
    });
  });

  /* Gallery section header */
  gsap.from('.gallery .section-header', {
    scrollTrigger: { trigger: '.gallery', start: 'top 80%', toggleActions: 'play none none reverse' },
    y: 40, opacity: 0, duration: .9, ease: 'power3.out'
  });

  /* ================================================================
     CONTACT — fade + slide up
     ================================================================ */
  gsap.from('.contact__inner > *', {
    scrollTrigger: { trigger: '.contact', start: 'top 80%', toggleActions: 'play none none reverse' },
    y: 30,
    opacity: 0,
    duration: .7,
    stagger: .12,
    ease: 'power3.out'
  });

  /* ================================================================
     SCATTER STRIPS — subtle parallax
     ================================================================ */
  gsap.utils.toArray('.scatter-strip').forEach(strip => {
    gsap.to(strip, {
      scrollTrigger: {
        trigger: strip,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      },
      x: 30,
      ease: 'none'
    });
  });

})();
