document.addEventListener('DOMContentLoaded', () => {
    const requestForm = document.getElementById('request-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message'); // Tambahkan ini

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            // Tetap hentikan refresh halaman
            e.preventDefault();

            const form = e.target;
            const data = new FormData(form);

            // Kirim data ke Formspree secara asynchronous
            fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    // Jika sukses
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    form.reset();
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 5000);
                } else {
                    // Jika gagal
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            errorMessage.textContent = data["errors"].map(error => error["message"]).join(", ")
                        } else {
                            errorMessage.textContent = 'Oops! Terjadi kesalahan. Coba lagi nanti.';
                        }
                        errorMessage.style.display = 'block';
                    })
                }
            }).catch(error => {
                // Jika ada error jaringan
                errorMessage.textContent = 'Oops! Terjadi kesalahan jaringan.';
                errorMessage.style.display = 'block';
            });
        });
    }

    // ... (logika menu mobile tetap sama) ...
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }
});
