/**
 * LAZISMU WEBSITE MODULE (Enhanced)
 * - Multi-language (TR/EN/AR)
 * - Dark mode persistence
 * - Slider autoplay + controls
 * - Skeleton loading + animations
 * - Demo News rendering + Article detail
 *
 * @version 3.0.0
 */
(function () {
  'use strict';

  const App = {
    config: {
      googleSheetId: 'GANTI_DENGAN_ID_SHEET_ANDA',
      sliderAutoplayDelay: 5000,
    },

    state: {
      programs: [],
      articles: [
        {
          id: 'pendidikan-berdaya',
          title: 'Pendidikan Berdaya di Gaziantep',
          date: '2025-07-18',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
          excerpt: 'Kelas literasi dan sains sederhana untuk anak-anak pengungsi.',
          content: 'Program ini menghadirkan relawan pengajar dan modul pembelajaran kreatif untuk anak-anak pengungsi di Gaziantep. Fokus utamanya adalah literasi, numerasi, serta sains sederhana melalui eksperimen menyenangkan.'
        },
        {
          id: 'layanan-kesehatan-mobile',
          title: 'Layanan Kesehatan Mobile',
          date: '2025-08-01',
          image: 'https://images.unsplash.com/photo-1584467735871-6cd497c7c9a2?q=80&w=1200&auto=format&fit=crop',
          excerpt: 'Klinik keliling untuk menjangkau daerah terpencil.',
          content: 'Tim medis Lazismu Türkiye menyediakan layanan kesehatan dasar, vaksinasi, dan konsultasi gizi dengan sistem janji online serta pencatatan digital yang transparan.'
        },
        {
          id: 'iftaar-kolaborasi',
          title: 'Iftaar Kolaborasi, Dampak Maksimal',
          date: '2025-04-05',
          image: 'https://images.unsplash.com/photo-1517420704952-7bd606da36a7?q=80&w=1200&auto=format&fit=crop',
          excerpt: 'Sinergi komunitas untuk berbagi buka puasa.',
          content: 'Dengan kolaborasi komunitas lokal, ribuan paket iftar dibagikan di beberapa distrik Istanbul, menggerakkan donatur muda untuk terlibat dalam aksi sosial.'
        }
      ],
      currentLang: 'tr',
      currentSlide: 0,
      sliderInterval: null,
    },

    elements: {},

    init() {
      this.cacheElements();
      this.restorePreferences();
      this.setupEventListeners();
      this.initSlider();
      this.fetchPrograms();
      this.initScrollAnimations();
      this.initNewsTeaser();
      this.routePage();
    },

    cacheElements() {
      this.elements.programContainer = document.getElementById('program-container');
      this.elements.langButtons = document.querySelectorAll('.language-switcher button');
      this.elements.slides = document.querySelectorAll('.hero-slider .slide');
      this.elements.sliderNav = {
        prev: document.querySelector('.slider-nav .prev'),
        next: document.querySelector('.slider-nav .next'),
      };
      this.elements.mobileNavToggle = document.querySelector('.mobile-nav-toggle');
      this.elements.mainNav = document.querySelector('.main-nav');
      this.elements.themeToggle = document.getElementById('theme-toggle');
      this.elements.homeNews = document.getElementById('home-news');
    },

    restorePreferences() {
      // Theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      // Language
      const savedLang = localStorage.getItem('lang') || 'tr';
      this.setLanguage(savedLang);
    },

    setupEventListeners() {
      this.elements.langButtons.forEach(btn =>
        btn.addEventListener('click', () => this.setLanguage(btn.id.replace('lang-', '')))
      );
      if (this.elements.sliderNav.prev && this.elements.sliderNav.next) {
        this.elements.sliderNav.prev.addEventListener('click', () => this.changeSlide('prev'));
        this.elements.sliderNav.next.addEventListener('click', () => this.changeSlide('next'));
      }
      if (this.elements.mobileNavToggle) {
        this.elements.mobileNavToggle.addEventListener('click', () => this.toggleMobileNav());
      }
      if (this.elements.themeToggle) {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
      }
      // Pause autoplay on hover
      const slider = document.querySelector('.hero-slider');
      if (slider) {
        slider.addEventListener('mouseenter', () => clearInterval(this.state.sliderInterval));
        slider.addEventListener('mouseleave', () => this.startSliderAutoplay());
      }
    },

    /* ========== Language ========== */
    setLanguage(lang) {
      this.state.currentLang = ['tr','en','ar'].includes(lang) ? lang : 'tr';
      document.documentElement.lang = this.state.currentLang;
      localStorage.setItem('lang', this.state.currentLang);

      // Toggle active state
      document.querySelectorAll('.language-switcher button').forEach(btn => {
        const isActive = btn.id === `lang-${this.state.currentLang}`;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      // Update texts
      document.querySelectorAll('[data-tr]').forEach(el => {
        const key = this.state.currentLang;
        const datasetKey = key;
        const content = el.dataset[datasetKey] || el.dataset['tr'] || el.textContent;
        if (content !== undefined) el.textContent = content;
      });

      // Re-render programs for truncated description
      if (this.state.programs.length > 0) this.renderPrograms();
    },

    /* ========== Theme ========== */
    toggleTheme() {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    },

    /* ========== Mobile Nav ========== */
    toggleMobileNav() {
      this.elements.mainNav.style.display = this.elements.mainNav.style.display === 'block' ? 'none' : 'block';
    },

    /* ========== Slider ========== */
    initSlider() {
      if (!this.elements.slides || this.elements.slides.length <= 1) return;
      this.startSliderAutoplay();
    },
    startSliderAutoplay() {
      clearInterval(this.state.sliderInterval);
      this.state.sliderInterval = setInterval(() => this.changeSlide('next'), this.config.sliderAutoplayDelay);
    },
    changeSlide(direction) {
      const slides = this.elements.slides;
      if (!slides || !slides.length) return;
      slides[this.state.currentSlide].classList.remove('active');

      if (direction === 'next') {
        this.state.currentSlide = (this.state.currentSlide + 1) % slides.length;
      } else {
        this.state.currentSlide = (this.state.currentSlide - 1 + slides.length) % slides.length;
      }

      slides[this.state.currentSlide].classList.add('active');
    },

    /* ========== Programs (Google Sheets) ========== */
    async fetchPrograms() {
      if (!this.elements.programContainer) return;
      this.renderSkeletons(3);
      const sheetURL = `https://spreadsheets.google.com/feeds/list/${this.config.googleSheetId}/od6/public/values?alt=json`;
      try {
        const response = await fetch(sheetURL);
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const data = await response.json();
        this.state.programs = data.feed.entry.map(entry => ({
          title_tr: entry['gsx$title_tr']?.$t || 'Başlık Yok',
          title_en: entry['gsx$title_en']?.$t || 'No Title',
          title_ar: entry['gsx$title_ar']?.$t || 'بدون عنوان',
          description_tr: entry['gsx$description_tr']?.$t || 'Açıklama mevcut değil.',
          description_en: entry['gsx$description_en']?.$t || 'No description available.',
          description_ar: entry['gsx$description_ar']?.$t || 'لا يوجد وصف متاح.',
          image_url: entry['gsx$image_url']?.$t || ''
        }));
        this.renderPrograms();
      } catch (err) {
        console.warn('Falling back to demo programs:', err);
        this.state.programs = [
          {
            title_tr: 'Beşeri Bantuan',
            title_en: 'Humanitarian Aid',
            title_ar: 'مساعدات إنسانية',
            description_tr: 'Bersama bantu kebutuhan dasar keluarga rentan.',
            description_en: 'Together we support vulnerable families.',
            description_ar: 'معًا ندعم الأسر الضعيفة.',
            image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop'
          },
          {
            title_tr: 'Beasiswa Anak',
            title_en: 'Child Scholarship',
            title_ar: 'منح دراسية للأطفال',
            description_tr: 'Dukung biaya pendidikan dan alat belajar.',
            description_en: 'Support tuition and learning kits.',
            description_ar: 'ندعم الرسوم الدراسية وأدوات التعلم.',
            image_url: 'https://images.unsplash.com/photo-1456327102063-fb5054efe647?q=80&w=1200&auto=format&fit=crop'
          },
          {
            title_tr: 'Klinik Gratis',
            title_en: 'Free Clinic',
            title_ar: 'عيادة مجانية',
            description_tr: 'Pelayanan kesehatan dasar keliling.',
            description_en: 'Mobile primary healthcare services.',
            description_ar: 'خدمات رعاية صحية أولية متنقلة.',
            image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop'
          }
        ];
        this.renderPrograms();
      }
    },

    renderPrograms() {
      const c = this.elements.programContainer;
      if (!c) return;
      c.innerHTML = '';
      const lang = this.state.currentLang;
      this.state.programs.forEach(program => {
        const title = program[`title_${lang}`] || program.title_tr;
        const descFull = program[`description_${lang}`] || program.description_tr;
        const description = (descFull || '').slice(0, 120) + '…';
        const card = document.createElement('div');
        card.className = 'program-card';
        card.setAttribute('data-animated', 'true');
        card.innerHTML = `
          <div class="card-image" style="background-image:url('${program.image_url}')"></div>
          <div class="card-content">
            <h3 class="card-title">${title}</h3>
            <p class="card-desc">${description}</p>
          </div>
          <div class="card-footer">
            <div class="progress-bar" aria-hidden="true"></div>
          </div>`;
        c.appendChild(card);
        this.observeOnce(card);
      });
      c.setAttribute('aria-busy', 'false');
    },

    renderSkeletons(n = 3) {
      const c = this.elements.programContainer;
      if (!c) return;
      let out = '';
      for (let i = 0; i < n; i++) {
        out += `
        <div class="program-card skeleton">
          <div class="card-image skeleton-anim"></div>
          <div class="card-content">
            <div class="card-title skeleton-anim"></div>
            <div class="card-desc skeleton-anim"></div>
            <div class="card-desc skeleton-anim" style="width:70%"></div>
          </div>
          <div class="card-footer">
            <div class="progress-bar-bg skeleton-anim"></div>
          </div>
        </div>`;
      }
      c.innerHTML = out;
    },

    /* ========== Animations on Scroll ========== */
    initScrollAnimations() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp .8s ease-out forwards';
            this.observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
    },
    observeOnce(el) {
      if (this.observer) this.observer.observe(el);
    },

    /* ========== News (Demo) ========== */
    initNewsTeaser() {
      if (!this.elements.homeNews) return;
      const target = this.elements.homeNews;
      target.innerHTML = '';
      this.state.articles.slice(0,3).forEach(a => {
        const card = document.createElement('a');
        card.className = 'news-card';
        card.href = `artikel-detail.html?id=${encodeURIComponent(a.id)}`;
        card.innerHTML = `
          <div class="news-card-image" style="background-image:url('${a.image}')"></div>
          <div class="news-card-content">
            <div class="news-card-meta">${new Date(a.date).toLocaleDateString()}</div>
            <h3 class="news-card-title">${a.title}</h3>
            <p>${a.excerpt}</p>
          </div>`;
        target.appendChild(card);
      });
    },

    /* ========== Router for berita & artikel pages ========== */
    routePage() {
      // berita.html
      const allContainer = document.getElementById('all-articles-container');
      if (allContainer) {
        allContainer.innerHTML = '';
        this.state.articles.forEach(a => {
          const card = document.createElement('a');
          card.className = 'news-card';
          card.href = `artikel-detail.html?id=${encodeURIComponent(a.id)}`;
          card.innerHTML = `
            <div class="news-card-image" style="background-image:url('${a.image}')"></div>
            <div class="news-card-content">
              <div class="news-card-meta">${new Date(a.date).toLocaleDateString()}</div>
              <h3 class="news-card-title">${a.title}</h3>
              <p>${a.excerpt}</p>
            </div>`;
          allContainer.appendChild(card);
          this.observeOnce(card);
        });
      }

      // artikel-detail.html
      const articleDetailContainer = document.getElementById('article-detail-container');
      if (articleDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const article = this.state.articles.find(x => x.id === id) || this.state.articles[0];
        articleDetailContainer.innerHTML = `
          <header class="article-header" style="background-image:url('${article.image}')">
            <div class="container">
              <h1 class="article-title">${article.title}</h1>
              <div class="article-meta">${new Date(article.date).toLocaleDateString()}</div>
            </div>
          </header>
          <section class="article-content">
            <div class="container">
              <p>${article.content}</p>
              <p>Gerakan ini dibiayai secara transparan dan akuntabel. Terima kasih kepada para donatur yang terus mendukung.</p>
              <p><a class="donate-button" href="#">Donasi Sekarang</a></p>
            </div>
          </section>
        `;
      }
    }
  };

  // Register basic keyframes via JS injection (only once)
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeInUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:translate3d(0,0,0)}}`;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
