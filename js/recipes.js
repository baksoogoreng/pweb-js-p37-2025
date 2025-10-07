// Ambil nama pengguna dari localStorage
const firstName = localStorage.getItem('firstName');

// Tampilkan di navbar
const welcomeText = document.getElementById('welcomeText');
if (firstName) {
  welcomeText.textContent = `Welcome, ${firstName}`;
} else {
  welcomeText.textContent = 'Welcome, Guest';
}

// Tombol logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Hapus data login dari localStorage
  localStorage.removeItem('firstName');
  alert('You have been logged out.');
  window.location.href = 'index.html'; // kembali ke halaman login
});
