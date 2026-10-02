// Красавчик — студия груминга
document.addEventListener('DOMContentLoaded', () => {

  /* Шапка: стекло при скролле */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Бургер-меню */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const closeMenu = () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
  };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('modal-open', open);
  });

  nav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));

  /* Появление блоков при скролле */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* Лёгкий параллакс плавающих карточек за курсором (только по вертикали,
     чтобы карточки не наезжали на лицо и заголовок) */
  const cards = document.querySelectorAll('[data-float]');
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (fine) {
    window.addEventListener('mousemove', e => {
      const dy = (e.clientY / window.innerHeight - 0.5);
      cards.forEach((card, i) => {
        const depth = 10 + i * 6;
        card.style.translate = `0 ${dy * depth}px`;
      });
    }, { passive: true });
  }

  /* Модальное окно записи */
  const modal = document.getElementById('modal');
  const form = document.getElementById('book-form');
  const success = document.getElementById('modal-success');

  const openModal = () => {
    modal.hidden = false;
    document.body.classList.add('modal-open');
    success.hidden = true;
    form.hidden = false;
    form.reset();
    setTimeout(() => form.querySelector('input')?.focus(), 120);
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  document.querySelectorAll('[data-modal-open]').forEach(btn =>
    btn.addEventListener('click', openModal));
  document.querySelectorAll('[data-modal-close]').forEach(el =>
    el.addEventListener('click', closeModal));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      closeMenu();
    }
  });

  /* Отправка формы: в Telegram (если настроен) или демо-режим */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const text =
      '🐾 Новая заявка с сайта\n' +
      `Имя: ${data.get('name')}\n` +
      `Телефон: ${data.get('phone')}\n` +
      `Питомец: ${data.get('pet')}\n` +
      `Услуга: ${data.get('service')}\n` +
      `Комментарий: ${data.get('comment') || '—'}`;

    const configured = typeof TELEGRAM !== 'undefined' && TELEGRAM.botToken && TELEGRAM.chatId;
    const send = configured
      ? fetch(`https://api.telegram.org/bot${TELEGRAM.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM.chatId, text })
        }).then(r => r.ok)
      : Promise.resolve(true); // демо-режим: токен ещё не вписан

    send.then(ok => {
      if (!ok) console.warn('Заявка не доставлена в Telegram — проверьте токен');
      form.hidden = true;
      success.hidden = false;
    }).catch(() => {
      form.hidden = true;
      success.hidden = false;
    });
  });
});
