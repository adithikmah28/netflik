document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('request-form');
    const successMessage = document.getElementById('success-message');

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            // Mencegah form mengirim data dan me-refresh halaman
            e.preventDefault();

            // Tampilkan pesan sukses
            successMessage.style.display = 'block';

            // Reset form setelah dikirim
            requestForm.reset();

            // Sembunyikan pesan setelah beberapa detik
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);
        });
    }

    // Logika untuk menu mobile di halaman ini
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');

    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }
});
