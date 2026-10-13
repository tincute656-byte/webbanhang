// Tailwind chỉ là CSS – các hành vi (click, toggle...) phải tự viết bằng JavaScript.
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn  = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('icon-open');
  const iconClose  = document.getElementById('icon-close');
  const header     = document.getElementById('site-header');

  // 1) Toggle menu mobile: đổi class hidden <-> flex
  function setMenu(open) {
    mobileMenu.classList.toggle('hidden', !open);
    mobileMenu.classList.toggle('flex', open);
    mobileMenu.classList.toggle('flex-col', open);
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  }

  toggleBtn.addEventListener('click', () => {
    setMenu(mobileMenu.classList.contains('hidden'));
  });

  // Chọn một link thì đóng menu
  mobileMenu.querySelectorAll('.mobile-link').forEach(link =>
    link.addEventListener('click', () => setMenu(false))
  );

  // Phím Esc đóng menu; kéo rộng màn hình ≥ md thì reset để không lỗi hiển thị
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 768px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // 2) Đổ bóng header khi cuộn
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 3) Đánh dấu link menu theo section đang xem
  const links = document.querySelectorAll('.nav-link');
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // 4) Form đặt bánh: kiểm tra đơn giản + thông báo (chưa gửi server)
  const form = document.getElementById('order-form');
  const msg  = document.getElementById('form-message');

  function showMessage(text, ok) {
    msg.textContent = text;
    msg.className = 'is-visible rounded-lg px-4 py-3 text-sm ' +
      (ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ten = form.ten.value.trim();
    const sdt = form.sdt.value.replace(/\s+/g, '');
    if (!ten) { showMessage('Vui lòng nhập tên của bạn.', false); form.ten.focus(); return; }
    if (!/^(0|\+84)\d{9,10}$/.test(sdt)) { showMessage('Số điện thoại chưa đúng, ví dụ: 0901 234 567.', false); form.sdt.focus(); return; }
    showMessage(`Cảm ơn ${ten}! Tiệm đã nhận yêu cầu và sẽ gọi lại cho bạn sớm nhất.`, true);
    form.reset();
  });

  // 5) Năm bản quyền tự cập nhật
  document.getElementById('year').textContent = new Date().getFullYear();
});