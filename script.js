// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    // Fungsi untuk memuat data dari file JSON dan menampilkannya
    // categoryName: nama file (misal: 'movies')
    // elementId: id div tempat menaruh poster (misal: 'movies-list')
    const loadCategory = async (categoryName, elementId) => {
        const container = document.getElementById(elementId);
        if (!container) return; // Keluar jika wadah tidak ditemukan

        try {
            // 1. Ambil data dari file JSON
            const response = await fetch(`data/${categoryName}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // 2. Kosongkan container sebelum diisi
            container.innerHTML = ''; 

            // 3. Loop setiap item data dan buat kartu film
            data.forEach(item => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                movieCard.title = item.title; // Tooltip saat hover

                movieCard.innerHTML = `
                    <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                `;
                
                container.appendChild(movieCard);
            });

        } catch (error) {
            console.error(`Gagal memuat kategori ${categoryName}:`, error);
            container.innerHTML = `<p style="color: #ff9999;">Gagal memuat data. Coba lagi nanti.</p>`;
        }
    };

    // Muat semua kategori film
    loadCategory('movies', 'movies-list');
    loadCategory('series', 'series-list');
    loadCategory('indonesia', 'indonesia-list');


    // Efek scroll pada header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
