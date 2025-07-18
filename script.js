document.addEventListener('DOMContentLoaded', () => {
    const TMDB_API_KEY = '8c79e8986ea53efac75026e541207aa3';
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const searchIcon = document.querySelector('.search-icon');

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
    if (hamburger && navbar && navCloseBtn) {
        hamburger.addEventListener('click', () => navbar.classList.add('nav-active'));
        navCloseBtn.addEventListener('click', () => navbar.classList.remove('nav-active'));
    }
    if (searchIcon && header) {
        const searchInputForIcon = document.getElementById('search-input');
        searchIcon.addEventListener('click', () => {
            header.classList.toggle('search-active');
            if (header.classList.contains('search-active') && searchInputForIcon) {
                searchInputForIcon.focus();
            }
        });
    }

    const defaultRowsContainer = document.getElementById('default-rows');
    const searchResultsContainer = document.getElementById('search-results-container');
    
    if (defaultRowsContainer && searchResultsContainer) {
        let allContent = [];
        const searchInput = document.getElementById('search-input');
        const searchResultsGrid = document.getElementById('search-results-grid');
        const searchResultsTitle = document.getElementById('search-results-title');
        
        const createMovieCard = (item) => {
            const anchor = document.createElement('a');
            anchor.className = 'movie-card-link';
            anchor.href = `streaming.html?type=${item.type}&id=${item.id}`;
            const qualityLower = (item.quality || '').toLowerCase();
            let qualityClass = '';
            if (qualityLower === 'hd') qualityClass = 'quality-hd';
            else if (qualityLower === 'sd') qualityClass = 'quality-sd';
            else if (qualityLower === 'cam') qualityClass = 'quality-cam';
            anchor.innerHTML = `
                <div class="poster-wrapper"><img src="${item.posterUrl}" alt="${item.title}" loading="lazy"><div class="movie-card-info">${ qualityClass ? `<span class="quality-badge ${qualityClass}">${item.quality}</span>` : '' }<span class="rating-badge"><i class="fas fa-star"></i> ${item.rating || 'N/A'}</span></div></div>
                <h3 class="movie-title">${item.title}</h3>
            `;
            return anchor;
        };
        
        const renderSearchResults = (results) => {
            searchResultsGrid.innerHTML = '';
            if (results.length === 0) {
                searchResultsTitle.textContent = 'Tidak ada hasil ditemukan';
            } else {
                searchResultsTitle.textContent = `Hasil Pencarian (${results.length})`;
                results.forEach(item => searchResultsGrid.appendChild(createMovieCard(item)));
            }
        };

        const loadCategoryPreview = async (categoryName, elementId, limit) => {
            try {
                const response = await fetch(`data/${categoryName}.json`);
                if (!response.ok) throw new Error("File tidak ditemukan");
                const data = await response.json();
                const container = document.getElementById(elementId);
                data.reverse().slice(0, limit).forEach(item => {
                    container.appendChild(createMovieCard(item));
                });
            } catch (error) {
                console.error(`Gagal memuat preview untuk ${categoryName}:`, error);
            }
        };
        
        const loadAllContentForSearch = async () => {
            if (allContent.length > 0) return;
            try {
                const [moviesRes, seriesRes, indonesiaRes] = await Promise.all([
                    fetch('data/movies.json'), fetch('data/series.json'), fetch('data/indonesia.json')
                ]);
                const movies = await moviesRes.json();
                const series = await seriesRes.json();
                const indonesia = await indonesiaRes.json();
                allContent = [...movies, ...series, ...indonesia];
            } catch (error) {
                console.error("Gagal memuat data untuk pencarian:", error);
            }
        };

        const loadTrending = async () => {
            const container = document.getElementById('trending-list');
            if (!container) return;
            await loadAllContentForSearch();
            const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                const trendingTitles = data.results.map(item => (item.title || item.name).toLowerCase());
                const ourTrendingMovies = allContent.filter(item => {
                    const titleWithoutYear = item.title.replace(/\s\(\d{4}\)/, '').toLowerCase();
                    return trendingTitles.some(trendingTitle => 
                        titleWithoutYear.includes(trendingTitle) || trendingTitle.includes(titleWithoutYear)
                    );
                });
                container.innerHTML = '';
                if (ourTrendingMovies.length > 0) {
                    ourTrendingMovies.slice(0, 10).forEach(item => {
                        container.appendChild(createMovieCard(item));
                    });
                } else {
                    container.innerHTML = '<p style="color: #ccc; padding-left: 5%;">Belum ada film trending di koleksi kami.</p>';
                }
            } catch (error) {
                console.error("Gagal memuat data trending:", error);
                container.innerHTML = '<p style="color: #ccc; padding-left: 5%;">Gagal memuat trending.</p>';
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                if (searchTerm.length > 0) {
                    defaultRowsContainer.style.display = 'none';
                    searchResultsContainer.style.display = 'block';
                    const filteredResults = allContent.filter(item => {
                        const mainTitleMatch = item.title.toLowerCase().includes(searchTerm);
                        let altTitleMatch = false;
                        if (item.alternativeTitles && Array.isArray(item.alternativeTitles)) {
                            altTitleMatch = item.alternativeTitles.some(altTitle => altTitle.toLowerCase().includes(searchTerm));
                        }
                        return mainTitleMatch || altTitleMatch;
                    });
                    renderSearchResults(filteredResults);
                } else {
                    defaultRowsContainer.style.display = 'block';
                    searchResultsContainer.style.display = 'none';
                }
            });
        }
        
        const initializeApp = async () => {
            await loadAllContentForSearch();
            loadCategoryPreview('movies', 'movies-list', 10);
            loadCategoryPreview('series', 'series-list', 10);
            loadCategoryPreview('indonesia', 'indonesia-list', 10);
            loadTrending();
        };

        initializeApp();
    }
});
