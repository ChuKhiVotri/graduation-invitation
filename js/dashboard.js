const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('dashboardPassword');
const message = document.getElementById('dashboardMessage');
const stats = document.getElementById('stats');
const totalRsvps = document.getElementById('totalRsvps');
const tableWrap = document.getElementById('tableWrap');
const rsvpTable = document.getElementById('rsvpTable');
const refreshButton = document.getElementById('refreshButton');

let dashboardPassword = localStorage.getItem('dashboardPassword') || '';
if (dashboardPassword) passwordInput.value = dashboardPassword;

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

async function loadRsvps() {
  message.textContent = '';
  const response = await fetch('/api/rsvps', {
    headers: { 'x-dashboard-password': dashboardPassword }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Không tải được danh sách.');

  stats.hidden = false;
  tableWrap.hidden = false;
  totalRsvps.textContent = result.total || 0;

  if (!result.rows?.length) {
    rsvpTable.innerHTML = `<tr><td class="empty" colspan="5">Chưa có ai xác nhận.</td></tr>`;
    return;
  }

  rsvpTable.innerHTML = result.rows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(row.name)}</strong></td>
      <td>${escapeHtml(row.guest_slug || row.invite_name || '')}</td>
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(row.ip_address || '')}</td>
    </tr>
  `).join('');
}

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  dashboardPassword = passwordInput.value.trim();
  localStorage.setItem('dashboardPassword', dashboardPassword);
  try {
    await loadRsvps();
  } catch (error) {
    message.textContent = error.message;
  }
});

refreshButton?.addEventListener('click', async () => {
  try {
    await loadRsvps();
  } catch (error) {
    message.textContent = error.message;
  }
});
