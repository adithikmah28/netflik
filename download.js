document.addEventListener('DOMContentLoaded', async () => {
    // --- TEMPATKAN DIRECT LINK ADSTERRA DI SINI ---
    const ADSTERRA_DIRECT_LINKS = [
        "https://your-adsterra-direct-link-1.com",
        "https://your-adsterra-direct-link-2.com",
        "https://your-adsterra-direct-link-3.com"
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
    const adModal = document.getElementById('ad-modal-download');
    const adLinkBtn = document.getElementById('ad-link-download');
    
    let selectedVideoUrl = '';
    let selectedSubtitleUrl = '';
    let activeDownloadType = '';

    if (!type || !id) { titleEl.textContent = 'Konten tidak ditemukan'; return; }

    const openRealDownloadLink = () => {
        const targetUrl = (activeDownloadType === 'video') ? selectedVideoUrl : selectedSubtitleUrl;
        if (targetUrl) { window.open(targetUrl, '_blank'); }
        adModal.classList.remove('show');
    };

    adLinkBtn.addEventListener('click', () => {
        const randomAdLink = ADSTERRA_DIRECT_LINKS[Math.floor(Math.random() * ADSTERRA_DIRECT_LINKS.length)];
        window.open(randomAdLink, '_blank');
        setTimeout(openRealDownloadLink, 500);
    });

    qualitySelect.addEventListener('change', (e) => {
        selectedVideoUrl = e.target.value;
        videoDownloadBtn.classList.toggle('disabled', !selectedVideoUrl);
    });

    subtitleSelect.addEventListener('change', (e) => {
        selectedSubtitleUrl = e.target.value;
        subtitleDownloadBtn.classList.toggle('disabled', !selectedSubtitleUrl);
    });

    videoDownloadBtn.addEventListener('click', () => {
        if (videoDownloadBtn.classList.contains('disabled')) return;
        activeDownloadType = 'video';
        adModal.classList.add('show');
    });

    subtitleDownloadBtn.addEventListener('click', () => {
        if (subtitleDownloadBtn.classList.contains('disabled')) return;
        activeDownloadType = 'subtitle';
        adModal.classList.add('show');
    });

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
                    // --- PERUBAHANNYA ADA DI SINI ---
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
