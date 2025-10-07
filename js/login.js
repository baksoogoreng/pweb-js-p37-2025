const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  message.textContent = '';

  if (!password) {
    message.innerHTML = '<p class="error">Password tidak boleh kosong</p>';
    return;
  }

  message.innerHTML = '<p class="loading">Memeriksa kredensial...</p>';

  try {
    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Username atau password salah');
    }

    const user = await response.json();

    // Simpan firstName ke localStorage
    localStorage.setItem('firstName', user.firstName);

    message.innerHTML = `<p class="success">Login berhasil! Selamat datang, ${user.firstName}!</p>`;

    // Arahkan ke halaman recipes
    setTimeout(() => {
      window.location.href = 'recipes.html';
    }, 1200);

  } catch (err) {
    message.innerHTML = `<p class="error">${err.message}</p>`;
  }
});
