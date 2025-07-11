document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    const titleEl = document.getElementById('download-title');
    const containerEl = document.getElementById('download-links-container');

    if (!type || !id) {
        titleEl.textContent = 'Konten tidak ditemukan';
        return;
    }

    try {
        let dataSources = [
            fetch('data/movies.json'),
            fetch('data/series.json'),
            fetch('data/indonesia.json')
        ];
        
        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) {
            if (response.ok) allData.push(...await response.json());
        }

        const contentData = allData.find(item => item.id === id);

        if (contentData) {
            titleEl.textContent = `Download: ${contentData.title}`;
            document.title = `Download: ${contentData.title} - Netflik`;

            containerEl.innerHTML = '';
            if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                contentData.downloadLinks.forEach(link => {
                    const button = document.createElement('a');
                    button.className = 'download-link-btn';
                    button.href = link.url;
                    button.target = '_blank'; // Buka di tab baru

                    button.innerHTML = `
                        <div class="download-info">
                            <i class="fas fa-film"></i>
                            <div>
                                <div class="quality">${link.quality}</div>
                                <div class="provider">${link.provider}</div>
                            </div>
                        </div>
                        <i class="fas fa-download download-icon"></i>
                    `;
                    containerEl.appendChild(button);
                });
            } else {
                containerEl.innerHTML = '<p style="text-align: center;">Maaf, link download untuk konten ini belum tersedia.</p>';
            }

        } else {
            titleEl.textContent = 'Konten tidak ditemukan';
        }

    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal memuat data.';
    }

    // Logika menu mobile
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }
});
