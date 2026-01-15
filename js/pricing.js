class CS_GalleryFilter {
	filtersSelector = ".cs-button";
	cardSelector = ".cs-card";
	activeClass = "cs-active";
	hiddenClass = "cs-hidden";

	constructor() {
		this.$card = document.querySelectorAll(this.cardSelector);
		const $filters = document.querySelectorAll(this.filtersSelector);

		this.onClick($filters[0]);

		for (const $filter of $filters) {
			$filter.addEventListener("click", () => this.onClick($filter));
		}
	}

	onClick($filter) {
		this.filter($filter.dataset.filter);

		const { activeClass } = this;

		this.$activeFilter?.classList.remove(activeClass);
		$filter.classList.add(activeClass);

		this.$activeFilter = $filter;
	}

	filter(filter) {
		const showAll = filter == "all";
		const { hiddenClass } = this;

		for (const $gallery of this.$card) {
			const show = showAll || $gallery.dataset.category == filter;
			$gallery.classList.toggle(hiddenClass, !show);
		}
	}
}

new CS_GalleryFilter();