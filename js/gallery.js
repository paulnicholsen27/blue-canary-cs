/**
 * Gallery Slider
 * Horizontal slideshow with prev/next buttons and dot indicators
 */

class GallerySlider {
    constructor(selector) {
        this.gallery = document.querySelector(selector);
        if (!this.gallery) return;
        
        this.track = this.gallery.querySelector('.cs-gallery-track');
        this.items = this.gallery.querySelectorAll('.cs-gallery-item');
        this.prevButton = this.gallery.querySelector('.cs-prev');
        this.nextButton = this.gallery.querySelector('.cs-next');
        this.dotsContainer = this.gallery.querySelector('.cs-gallery-dots');
        
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.totalSlides = Math.ceil(this.items.length / this.itemsPerView);
        
        this.init();
    }
    
    init() {
        this.createDots();
        this.updateSlider();
        this.attachEventListeners();
        
        // Update on window resize
        window.addEventListener('resize', () => {
            const newItemsPerView = this.getItemsPerView();
            if (newItemsPerView !== this.itemsPerView) {
                this.itemsPerView = newItemsPerView;
                this.totalSlides = Math.ceil(this.items.length / this.itemsPerView);
                this.currentIndex = Math.min(this.currentIndex, this.totalSlides - 1);
                this.createDots();
                this.updateSlider();
            }
        });
    }
    
    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 600) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    createDots() {
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('cs-gallery-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === this.currentIndex) {
                dot.classList.add('cs-active');
            }
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    attachEventListeners() {
        this.prevButton.addEventListener('click', () => this.prev());
        this.nextButton.addEventListener('click', () => this.next());
        
        // Keyboard navigation
        this.gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        const handleSwipe = () => {
            if (touchStartX - touchEndX > 50) {
                this.next();
            }
            if (touchEndX - touchStartX > 50) {
                this.prev();
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    updateSlider() {
        const itemWidth = 100 / this.itemsPerView;
        const offset = -this.currentIndex * 100;
        
        this.track.style.transform = `translateX(${offset}%)`;
        
        // Update items width
        this.items.forEach(item => {
            item.style.flex = `0 0 ${itemWidth}%`;
        });
        
        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.cs-gallery-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('cs-active', index === this.currentIndex);
        });
        
        // Update button states
        this.prevButton.disabled = this.currentIndex === 0;
        this.nextButton.disabled = this.currentIndex === this.totalSlides - 1;
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlider();
        }
    }
    
    next() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.currentIndex++;
            this.updateSlider();
        }
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GallerySlider('#gallery-1430');
});
