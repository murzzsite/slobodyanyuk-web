const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/N26X74HBAE';
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const safe = fn => { try { fn(); } catch (e) { console.error(e); } };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ');
  let lenis = null;

  /* платформы */
  safe(() => {
    const T = {
      tilda: 'Быстрый запуск и правка текстов без разработчика. Подходит для лендингов и небольших сайтов.',
      wp: 'Когда сайту нужно расти: разделы, статьи, плагины и гибкая структура.',
      joomla: 'Для контентных сайтов со сложной структурой разделов.',
      bitrix: 'Когда сайт связан с каталогом, учётом и интеграциями или команда уже работает на Битриксе.',
      code: 'Когда нужен точный дизайн, скорость и свобода без ограничений конструктора.'
    };
    const t = $('#techT');
    const show = k => { t.textContent = T[k]; };
    $$('#pills [data-k]').forEach(b => b.addEventListener('click', () => show(b.dataset.k)));
    show('tilda');
  });

  /* расчёт */
  const calc = { text: '' };
  safe(() => {
    const P = { land: 15000, bot: 15000, crm: 25000, ai: 25000, design: 10000 };
    const NAME = { land: 'Лендинг', site: 'Сайт под ключ', bot: 'Telegram-бот', crm: 'Подключение к amoCRM', ai: 'ИИ-агент', design: 'Дизайн ключевых экранов', custom: 'Автоматизация под задачу' };
    const sumEl = $('#sum'), noteEl = $('#sumN'), ver = $('#verdict');
    const chips = $$('#chain .ch'), links = $$('#chain .lk');
    let shown = 0, raf;
    const tween = to => {
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const step = t => {
        const p = reduce ? 1 : Math.min(1, (t - t0) / 450);
        shown = from + (to - from) * (1 - Math.pow(1 - p, 3));
        sumEl.textContent = prefix + fmt(shown) + suffix;
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    let prefix = 'от ', suffix = ' ₽';
    const render = () => {
      const base = $('input[name=base]:checked').value;
      const adds = $$('input[name=add]:checked').map(i => i.value);
      const has = k => adds.includes(k);
      let low = 0, high = 0;
      if (base === 'land') { low += P.land; high += P.land; }
      if (base === 'site') { low += 35000; high += 50000; }
      adds.forEach(k => { if (P[k]) { low += P[k]; high += P[k]; } });
      const range = high > low;
      prefix = range ? '' : 'от ';
      suffix = range ? '–' + fmt(high) + ' ₽' : ' ₽';
      tween(low);
      noteEl.textContent = has('custom') ? 'ориентир без индивидуальной части, её считаю отдельно' : 'ориентир, точную стоимость называю после обсуждения';

      const on = { site: true, bot: has('bot'), crm: has('crm'), ai: has('ai') };
      const order = ['site', 'bot', 'crm', 'ai'];
      chips.forEach((c, i) => c.classList.toggle('on', on[order[i]]));
      const idx = order.map((k, i) => on[k] ? i : -1).filter(i => i >= 0);
      const mn = Math.min(...idx), mx = Math.max(...idx);
      links.forEach((l, i) => l.classList.toggle('on', i >= mn && i + 1 <= mx));

      const parts = [];
      if (has('bot') && has('crm')) parts.push('Заявки из бота попадают в amoCRM сами.');
      else if (has('crm')) parts.push('Заявки с сайта попадают в amoCRM сами.');
      else if (has('bot')) parts.push('Заявки приходят в Telegram-бот, клиент получает ответ сразу.');
      if (has('ai')) parts.push('ИИ-агент отвечает по базе знаний компании, сложные диалоги передаёт вам.');
      if (!parts.length) parts.push(base === '0' && !adds.length ? 'Отметьте, что нужно: справа появятся соединённые звенья.' : 'Сайт сам принимает заявки, но дальше их придётся переносить вручную. Добавьте звенья, и это сделается само.');
      const links3 = (base !== '0' ? 1 : 0) + ['bot', 'crm', 'ai'].filter(has).length;
      if (links3 >= 3) parts.push('Все звенья делаю одним проектом: общее задание и один исполнитель.');
      ver.textContent = parts.join(' ');

      const names = [];
      if (base === 'land' || base === 'site') names.push(NAME[base]);
      adds.forEach(k => names.push(NAME[k]));
      calc.text = names.length ? names.join(' + ') + '. Ориентир: ' + (range ? fmt(low) + '–' + fmt(high) : 'от ' + fmt(low)) + ' ₽' + (has('custom') ? ' + индивидуальная часть' : '') : '';
    };
    $$('#ctl input').forEach(i => i.addEventListener('change', render));
    render();

    $('#sendCalc').addEventListener('click', () => {
      const task = $('#task'), line = 'Выбрано в расчёте: ' + calc.text;
      if (!calc.text) return;
      const rest = task.value.replace(/^Выбрано в расчёте:.*(\n|$)/, '');
      task.value = line + (rest ? '\n' + rest : '');
    });
  });

  /* телефон: маска только если вводят номер */
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      const raw = e.target.value;
      if (/[a-zA-Zа-яА-Я@_]/.test(raw)) return;
      let v = raw.replace(/\D/g, '');
      if (!v) { e.target.value = ''; return; }
      if (v[0] === '8') v = '7' + v.slice(1);
      if (v[0] !== '7') v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  /* форма -> Worker -> Telegram */
  safe(() => {
    const form = $('#leadForm');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
      const payload = {}; new FormData(form).forEach((v, k) => { payload[k] = v; });
      if (payload._gotcha) return;
      if (!payload.name || !payload.phone) { btn.textContent = 'Заполните имя и контакт'; setTimeout(() => btn.textContent = orig, 2500); return; }
      payload.comment = payload.task || '';
      delete payload.task; delete payload.calc;
      btn.disabled = true; btn.textContent = 'Отправляем...';
      try {
        const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        btn.textContent = 'Заявка отправлена'; form.reset();
      } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
      finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000); }
    });
  });

  /* якоря */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -10, duration: 1.3 });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* шаги: позиция вертикальной шкалы на телефоне */
  const placeBar = () => {
    const how = $('#how'), lis = $$('#steps li'), bar = $('#stepsBarW');
    if (!how || !lis.length) return;
    if (!matchMedia('(max-width:900px)').matches) { bar.style.removeProperty('--bt'); bar.style.removeProperty('--bh'); return; }
    const hr = how.getBoundingClientRect().top, a = lis[0].getBoundingClientRect().top, b = lis[lis.length - 1].getBoundingClientRect().top;
    bar.style.setProperty('--bt', (a - hr + 13) + 'px'); bar.style.setProperty('--bh', (b - a) + 'px');
  };
  safe(placeBar); addEventListener('resize', () => safe(placeBar));

  /* без движения: итоговые состояния */
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    $$('#steps li').forEach(l => l.classList.add('on'));
    return;
  }

  /* hero: наклон стопки за курсором */
  safe(() => {
    const st = $('#stack'), inn = $('.stack__in', st);
    if (!matchMedia('(pointer:fine)').matches) return;
    let tx = -14, ty = 6, cx = -14, cy = 6;
    addEventListener('pointermove', e => {
      const r = st.getBoundingClientRect();
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / innerWidth, -.6, .6), ny = clamp((e.clientY - (r.top + r.height / 2)) / innerHeight, -.6, .6);
      tx = -14 + nx * 26; ty = 6 - ny * 22;
    }, { passive: true });
    const loop = () => { cx += (tx - cx) * .07; cy += (ty - cy) * .07; inn.style.setProperty('--ry', cx.toFixed(2) + 'deg'); inn.style.setProperty('--rx', cy.toFixed(2) + 'deg'); requestAnimationFrame(loop); };
    loop();
  });

  gsap.registerPlugin(ScrollTrigger);
  lenis = new Lenis({ lerp: .1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* вход hero: окна влетают по очереди */
  safe(() => {
    gsap.from('.win', { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .14, delay: .25 });
    gsap.from('.hero__txt > *, .hero__act > *', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .08, delay: .35 });
  });

  /* заголовки в масках */
  $$('h2.mask').forEach(h => {
    const t = h.textContent; h.setAttribute('aria-label', t);
    h.innerHTML = '<span class="ln" aria-hidden="true"><i>' + t + '</i></span>';
    gsap.from(h.querySelector('i'), { yPercent: 110, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* манифест по словам */
  safe(() => {
    const m = $('#manifest'), words = m.textContent.trim().split(/\s+/);
    m.setAttribute('aria-label', m.textContent.trim());
    m.innerHTML = words.map(w => '<span class="w" aria-hidden="true">' + w + '</span>').join(' ');
    gsap.to('#manifest .w', { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: m, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* сцена: путь одной заявки */
  safe(() => {
    const scene = $('#scene'), pipe = $('#pipe');
    const nodes = $$('.node', pipe), wires = $$('.wire', pipe), ticket = $('#ticket'), caps = $$('.cap', scene), cnt = $('#cnt');
    scene.classList.add('is-scene');
    const S = { f: 0 };
    const cy = n => nodes[n].offsetTop + nodes[n].offsetHeight / 2 - ticket.offsetHeight / 2;
    const state = [];
    const paint = () => {
      const f = S.f, i = Math.min(2, Math.floor(f)), t = clamp(f - i, 0, 1);
      ticket.style.transform = 'translate3d(0,' + (cy(i) + (cy(i + 1) - cy(i)) * t) + 'px,0)';
      wires.forEach((w, k) => w.style.setProperty('--f', clamp(f - k, 0, 1).toFixed(3)));
      nodes.forEach((n, k) => {
        const on = f >= k - .02;
        if (state[k] !== on) {
          state[k] = on; n.classList.toggle('on', on);
          const sp = n.querySelector('span'); sp.textContent = on ? sp.dataset.d : sp.dataset.w;
        }
      });
      cnt.textContent = 3 - Math.min(3, Math.floor(f + .001));
      const c = Math.min(3, Math.round(f));
      caps.forEach((el, k) => el.classList.toggle('on', k === c));
    };
    paint();
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scene, start: 'top top', end: '+=330%', pin: '.scene__pin', scrub: .6, anticipatePin: 1 } });
    tl.to({}, { duration: .3 }).to(S, { f: 3, duration: 3, onUpdate: paint }).to({}, { duration: .35 });
    ScrollTrigger.addEventListener('refresh', paint);
    addEventListener('resize', paint);
  });

  /* бегущая строка */
  safe(() => {
    const mq = $('#marq'); let x = 0;
    gsap.ticker.add(() => {
      x -= .6 + Math.abs(lenis.velocity) * .35;
      const half = mq.scrollWidth / 2; if (-x >= half) x += half;
      mq.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  });

  /* шаги: шкала растёт по скроллу */
  safe(() => {
    const bar = $('#stepsBarW'), lis = $$('#steps li');
    ScrollTrigger.create({
      trigger: '#steps', start: 'top 70%', end: 'bottom 60%', scrub: true,
      onUpdate: s => {
        bar.style.setProperty('--p', s.progress.toFixed(3));
        lis.forEach((l, k) => l.classList.toggle('on', s.progress >= k / (lis.length - 1) - .03));
      }
    });
    bar.style.setProperty('--p', 0);
  });

  addEventListener('load', () => { placeBar(); ScrollTrigger.refresh(); });
})();
