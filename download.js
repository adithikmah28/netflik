document.addEventListener('DOMContentLoaded', async () => {
    // --- TEMPATKAN SEMUA DIRECT LINK ADSTERRA DI SINI ---
    const ADSTERRA_DIRECT_LINKS = [
        "https://your-adsterra-direct-link-1.com",
        "https://your-adsterra-direct-link-2.com",
        "https://your-adsterra-direct-link-3.com",
        "https://your-adsterra-direct-link-4.com"
    ];

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    const titleEl = document.getElementById('download-title');
    const qualitySelect = document.getElementById('quality-select');
    const subtitleSelect = document.getElementById('subtitle-select');
    const videoDownloadBtn = document.getElementById('video-download-btn');
    const subtitleDownloadBtn = document.getElementById('subtitle-download-btn');
    const videoSection = document.getElementById('video-section');
    const subtitleSection = document.getElementById('subtitle-section');
    const cancelBtn = document.getElementById('cancel-btn');

    if (!type || !id) {
        titleEl.textContent = 'Konten tidak ditemukan';
        return;
    }

    const handleDownloadClick = (button) => {
        const isUnlocked = button.dataset.unlocked === 'true';
        const url = button.dataset.url;

        if (isUnlocked) {
            if (url) {
                window.open(url, '_blank');
            }
        } else {
            const randomAdLink = ADSTERRA_DIRECT_LINKS[Math.floor(Math.random() * ADSTERRA_DIRECT_LINKS.length)];
            window.open(randomAdLink, '_blank');
            button.innerHTML = '<i class="fas fa-check"></i> LINK SIAP! KLIK LAGI';
            button.classList.remove('active');
            button.classList.add('unlocked');
            button.dataset.unlocked = 'true';
        }
    };

    const resetButton = (button, initialText) => {
        button.classList.add('disabled');
        button.classList.remove('active', 'unlocked');
        button.innerHTML = `<i class="fas fa-lock"></i> ${initialText}`;
        button.dataset.unlocked = 'false';
        button.dataset.url = '';
    };

    qualitySelect.addEventListener('change', (e) => {
        resetButton(subtitleDownloadBtn, 'Pilih Bahasa Dahulu');
        subtitleSelect.selectedIndex = 0;

        const selectedUrl = e.target.value;
        if (selectedUrl) {
            videoDownloadBtn.dataset.url = selectedUrl;
            videoDownloadBtn.classList.remove('disabled', 'unlocked');
            videoDownloadBtn.classList.add('active');
            videoDownloadBtn.innerHTML = '<i class="fas fa-download"></i> UNDUH SEKARANG';
            videoDownloadBtn.dataset.unlocked = 'false';
        } else {
            resetButton(videoDownloadBtn, 'Pilih Kualitas Dahulu');
        }
    });

    subtitleSelect.addEventListener('change', (e) => {
        resetButton(videoDownloadBtn, 'Pilih Kualitas Dahulu');
        qualitySelect.selectedIndex = 0;

        const selectedUrl = e.target.value;
        if (selectedUrl) {
            subtitleDownloadBtn.dataset.url = selectedUrl;
            subtitleDownloadBtn.classList.remove('disabled', 'unlocked');
            subtitleDownloadBtn.classList.add('active');
            subtitleDownloadBtn.innerHTML = '<i class="fas fa-download"></i> UNDUH SEKARANG';
            subtitleDownloadBtn.dataset.unlocked = 'false';
        } else {
            resetButton(subtitleDownloadBtn, 'Pilih Bahasa Dahulu');
        }
    });

    videoDownloadBtn.addEventListener('click', () => handleDownloadClick(videoDownloadBtn));
    subtitleDownloadBtn.addEventListener('click', () => handleDownloadClick(subtitleDownloadBtn));
    cancelBtn.addEventListener('click', () => history.back());

    try {
        let dataSources = [fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')];
        const responses = await Promise.all(dataSources);
        let allData = [];
        for (const response of responses) {
            if (response.ok) allData.push(...await response.json());
        }
        const contentData = allData.find(item => item.id === id);

        if (contentData) {
            titleEl.textContent = `Download Hub: ${contentData.title}`;
            document.title = `Download: ${contentData.title} - Netflik`;

            if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                videoSection.style.display = 'flex';
                contentData.downloadLinks.forEach(link => {
                    const option = new Option(link.quality, link.url);
                    qualitySelect.add(option);
                });
            }

            if (contentData.subtitleLinks && contentData.subtitleLinks.length > 0) {
                subtitleSection.style.display = 'flex';
                contentData.subtitleLinks.forEach(link => {
                    const option = new Option(link.language, link.url);
                    subtitleSelect.add(option);
                });
            }
        } else {
            titleEl.textContent = 'Data konten tidak ditemukan';
        }
    } catch (error) {
        console.error('Error:', error);
        titleEl.textContent = 'Gagal memuat data.';
    }
});
