/**
 * Gallery Slider
 * Infinite horizontal slideshow with cloned slides for seamless looping.
 */

class GallerySlider {
    constructor(selector) {
        this.gallery = document.querySelector(selector);
        if (!this.gallery) return;

        this.track = this.gallery.querySelector('.cs-gallery-track');
        this.originalItems = Array.from(this.gallery.querySelectorAll('.cs-gallery-item'));
        this.prevButton = this.gallery.querySelector('.cs-prev');
        this.nextButton = this.gallery.querySelector('.cs-next');
        this.dotsContainer = this.gallery.querySelector('.cs-gallery-dots');

        this.totalSlides = this.originalItems.length;
        this.itemsPerView = this.getItemsPerView();
        this.currentIndex = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        if (!this.track || this.totalSlides === 0) return;

        this.cloneSlides();
        this.items = Array.from(this.track.querySelectorAll('.cs-gallery-item'));
        this.createDots();
        this.setInitialPosition();
        this.attachEventListeners();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const newItemsPerView = this.getItemsPerView();
                if (newItemsPerView !== this.itemsPerView) {
                    this.itemsPerView = newItemsPerView;
                    this.rebuildClones();
                }
            }, 200);
        });
    }

    getItemsPerView() {
        const width = window.innerWidth;
        if (width < 600) return 1;
        if (width < 1024) return 2;
        return 3;
    }

    cloneSlides() {
        const cloneCount = Math.min(this.itemsPerView, this.totalSlides);

        // prepend clones of last N
        for (let i = this.totalSlides - cloneCount; i < this.totalSlides; i++) {
            const clone = this.originalItems[i].cloneNode(true);
            // clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('cs-clone');
            this.track.insertBefore(clone, this.track.firstChild);
        }

        // append clones of first N
        for (let i = 0; i < cloneCount; i++) {
            const clone = this.originalItems[i].cloneNode(true);
            // clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('cs-clone');
            this.track.appendChild(clone);
        }
    }

    rebuildClones() {
        this.track.querySelectorAll('.cs-clone').forEach((n) => n.remove());
        this.cloneSlides();
        this.items = Array.from(this.track.querySelectorAll('.cs-gallery-item'));
        this.setInitialPosition();
        this.createDots();
    }

    setInitialPosition() {
        // first real slide starts after the prepended clones
        this.currentIndex = Math.min(this.itemsPerView, this.totalSlides);
        this.updateSlider(false);
    }

    createDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('cs-gallery-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('cs-active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    attachEventListeners() {
        if (this.prevButton) this.prevButton.addEventListener('click', () => this.prev());
        if (this.nextButton) this.nextButton.addEventListener('click', () => this.next());

        this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

        this.gallery.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        let touchStartX = 0;
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        this.track.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) this.next();
            if (touchEndX - touchStartX > 50) this.prev();
        });
    }

    updateSlider(animate = true) {
        const itemWidth = 100 / this.itemsPerView;
        const offset = -(this.currentIndex * itemWidth);

        this.track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
        this.track.style.transform = `translateX(${offset}%)`;

        this.items.forEach((item) => {
            item.style.flex = `0 0 ${itemWidth}%`;
        });

        const realIndex = this.getRealIndex();
        if (this.dotsContainer) {
            this.dotsContainer.querySelectorAll('.cs-gallery-dot').forEach((dot, i) => {
                dot.classList.toggle('cs-active', i === realIndex);
            });
        }
    }

    getRealIndex() {
        const cloneCount = Math.min(this.itemsPerView, this.totalSlides);
        const adjusted = this.currentIndex - cloneCount;

        if (adjusted < 0) return this.totalSlides + adjusted;
        if (adjusted >= this.totalSlides) return adjusted - this.totalSlides;
        return adjusted;
    }

    handleTransitionEnd() {
        const cloneCount = Math.min(this.itemsPerView, this.totalSlides);
        const adjusted = this.currentIndex - cloneCount;

        // If we’re in the prepended clones, jump to the matching real slide at the end.
        if (adjusted < 0) {
            this.currentIndex = cloneCount + this.totalSlides + adjusted;
            this.updateSlider(false);
        }

        // If we’re in the appended clones, jump to the matching real slide at the start.
        if (adjusted >= this.totalSlides) {
            this.currentIndex = cloneCount + (adjusted - this.totalSlides);
            this.updateSlider(false);
        }

        this.isTransitioning = false;
    }

    prev() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex -= 1;
        this.updateSlider(true);
    }

    next() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex += 1;
        this.updateSlider(true);
    }

    goToSlide(index) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const cloneCount = Math.min(this.itemsPerView, this.totalSlides);
        this.currentIndex = cloneCount + index;
        this.updateSlider(true);
    }
}

(function initWhenReady() {
    const init = () => {
        new GallerySlider('#gallery');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
        return;
    }

    init();
})();
