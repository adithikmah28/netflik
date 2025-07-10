document.addEventListener('DOMContentLoaded', () => {
    
    const loadCategory = async (categoryName, elementId) => {
        const container = document.getElementById(elementId);
        if (!container) return;

        try {
            const response = await fetch(`data/${categoryName}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            container.innerHTML = ''; 

            data.forEach(item => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card';
                
                // Menentukan kelas CSS berdasarkan kualitas
                let qualityClass = '';
                if (item.quality === 'HD') qualityClass = 'quality-hd';
                else if (item.quality === 'SD') qualityClass = 'quality-sd';
                else if (item.quality === 'CAM') qualityClass = 'quality-cam';

                movieCard.innerHTML = `
                    <img src="${item.posterUrl}" alt="${item.title}" loading="lazy">
                    <div class="movie-card-info">
                        <span class="quality-badge ${qualityClass}">${item.quality}</span>
                        <span class="rating-badge">
                            <i class="fas fa-star"></i> ${item.rating}
                        </span>
                    </div>
                `;
                
                // Menambahkan event listener untuk membuka modal
                movieCard.addEventListener('click', () => {
                    openModal(item);
                });
                
                container.appendChild(movieCard);
            });

        } catch (error) {
            console.error(`Gagal memuat kategori ${categoryName}:`, error);
            container.innerHTML = `<p style="color: #ff9999;">Gagal memuat data.</p>`;
        }
    };

    // --- LOGIKA MODAL ---
    const modal = document.getElementById('video-modal');
    const closeModalButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const videoIframe = document.getElementById('video-iframe');

    // Fungsi untuk membuka modal
    const openModal = (movieData) => {
        modalTitle.textContent = movieData.title;
        modalDescription.textContent = movieData.description;
        videoIframe.src = movieData.trailerUrl;
        modal.style.display = 'block';
    };

    // Fungsi untuk menutup modal
    const closeModal = () => {
        modal.style.display = 'none';
        videoIframe.src = ''; // Menghentikan video saat modal ditutup
    };

    // Event listener untuk tombol close
    closeModalButton.addEventListener('click', closeModal);

    // Event listener untuk menutup modal jika klik di luar area konten
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });
    
    // --- MEMUAT SEMUA KATEGORI ---
    loadCategory('movies', 'movies-list');
    loadCategory('series', 'series-list');
    loadCategory('indonesia', 'indonesia-list');

    // --- EFEK SCROLL HEADER ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
