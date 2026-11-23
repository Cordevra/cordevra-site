// Shared script for cordevra.com feature pages and blog (no libraries).

// nav: dark over the page hero, light after it (same behavior as the home page)
const nav = document.getElementById('nav'), hero = document.querySelector('.phero');
if (nav && hero) {
  const setNav = () => nav.classList.toggle('light', hero.getBoundingClientRect().bottom < 80);
  addEventListener('scroll', setNav, {passive:true}); setNav();
}

// waitlist: same Google Form and fields as the home page. Visitors stay on this page.
const WAITLIST = 'https://docs.google.com/forms/d/e/1FAIpQLSdQN1Lk85_qr5LSlA4awDGe_FXv9tChav07g8fjTyBHdhtZ5g/formResponse';
const FIELDS = {email:'entry.1161790117', audience:'entry.1938122243', size:'entry.1167895717', role:'entry.410898957', tool:'entry.2001985338', source:'entry.317484'};
document.querySelectorAll('.js-waitlist').forEach(form => {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const input = form.querySelector('input[type=email]');
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { input.focus(); input.style.color = '#DC2626'; setTimeout(() => input.style.color = '', 1200); return }
    const btn = form.querySelector('button'); btn.disabled = true; btn.textContent = 'Sending…';
    const extra = form.parentElement.querySelector('.wl-extra');
    const val = name => extra?.querySelector(`select[name=${name}]`)?.value || '';
    const body = new URLSearchParams();
    body.set(FIELDS.email, email);
    body.set(FIELDS.audience, form.dataset.audience || 'Accounting firm');
    body.set(FIELDS.size, val('size')); body.set(FIELDS.role, val('role')); body.set(FIELDS.tool, val('tool'));
    // source: section id, host and page path, so signups from each page can be told apart
    body.set(FIELDS.source, (form.closest('section,header')?.id || 'page') + ' · ' + location.hostname + location.pathname);
    try { await fetch(WAITLIST, {method:'POST', mode:'no-cors', body}) } catch (err) { btn.disabled = false; btn.textContent = 'Try again'; const ok = form.parentElement.querySelector('.js-ok'); ok.style.display = 'block'; ok.innerHTML = 'Something went wrong. Please email <a href="mailto:support@cordevra.com" style="text-decoration:underline">support@cordevra.com</a>.'; return }
    form.style.display = 'none';
    if (extra) extra.style.display = 'none';
    form.parentElement.querySelector('.js-ok').style.display = 'block';
  });
});
