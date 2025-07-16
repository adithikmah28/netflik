document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const id = params.get('id');

    const titleEl = document.getElementById('download-title');
    const qualitySelect = document.getElementById('quality-select');
    const subtitleSelect = document.getElementById('subtitle-select');
    const videoDownloadLink = document.getElementById('video-download-link');
    const subtitleDownloadLink = document.getElementById('subtitle-download-link');
    const videoSection = document.getElementById('video-section');
    const subtitleSection = document.getElementById('subtitle-section');
    const cancelBtn = document.getElementById('cancel-btn');

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
        for (const response of responses) if (response.ok) allData.push(...await response.json());
        const contentData = allData.find(item => item.id === id);

        if (contentData) {
            titleEl.textContent = `Download Hub: ${contentData.title}`;
            document.title = `Download: ${contentData.title} - Netflik`;

            // Cek dan tampilkan bagian download video
            if (contentData.downloadLinks && contentData.downloadLinks.length > 0) {
                videoSection.style.display = 'flex';
                contentData.downloadLinks.forEach(link => {
                    const option = new Option(`${link.quality} - ${link.provider}`, link.url);
                    qualitySelect.add(option);
                });
            }

            // Cek dan tampilkan bagian download subtitle
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

    // Event listener untuk mengaktifkan tombol download
    qualitySelect.addEventListener('change', (e) => {
        if (e.target.value) {
            videoDownloadLink.href = e.target.value;
            videoDownloadLink.classList.remove('disabled');
        } else {
            videoDownloadLink.href = '#';
            videoDownloadLink.classList.add('disabled');
        }
    });

    subtitleSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            subtitleDownloadLink.href = e.target.value;
            subtitleDownloadLink.classList.remove('disabled');
        } else {
            subtitleDownloadLink.href = '#';
            subtitleDownloadLink.classList.add('disabled');
        }
    });

    // Event listener untuk tombol cancel
    cancelBtn.addEventListener('click', () => {
        // Kembali ke halaman sebelumnya
        history.back();
    });
});
