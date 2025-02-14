const eventUtils = require('../../common/event-utils');
const MAX_PAGES = 9;
const MIN_PAGES = 3;

module.exports = {
    /**
     * Handle normal mouse click for item, next page and previous page respectively.
     * @param {MouseEvent} originalEvent
     */
    handlePageNumberClick(index, originalEvent, el) {
        this.emit('select', {
            el,
            originalEvent,
            value: el.innerText,
            index,
        });
    },

    handleNextPageClick(originalEvent, el) {
        if (!el.hasAttribute('aria-disabled')) {
            this.emit('next', {
                el,
                originalEvent,
            });
        }
    },

    handlePreviousPageClick(originalEvent, el) {
        if (!el.hasAttribute('aria-disabled')) {
            this.emit('previous', {
                el,
                originalEvent,
            });
        }
    },

    onCreate() {
        this.state = { maxItems: 0 };
    },

    onMount() {
        this._calculateMaxItems();
        this.subscribeTo(eventUtils.resizeUtil).on('resize', this._calculateMaxItems.bind(this));
    },

    getItemTag(item) {
        if (item.variant) {
            return item.variant === 'link' ? 'a' : 'button';
        }
        return !!item.href ? 'a' : 'button';
    },

    /**
     * Calculates the start and end offsets given the current maximum items
     * that can be displayed.
     */
    _getVisibleRange(items) {
        const { state, input } = this;
        const { maxItems } = state;
        const { variant } = input;
        const hasDots = variant === 'show-last';
        const lastIndex = items.length - 1;
        const dotsIndex = hasDots ? lastIndex : -1;
        let hideDots = false;

        if (!maxItems) {
            return { start: 0, end: lastIndex, hideDots: true, dotsIndex };
        }

        const i = items.findIndex((item) => item.current);
        const range = Math.floor(maxItems / 2);
        let start = i - range;
        let end = i + range;

        if (start <= 0) {
            end = maxItems - 1;
            start = 0;
        } else if (end >= lastIndex) {
            end = lastIndex;
            start = lastIndex - (maxItems - 1);
        } else if (maxItems % 2 === 0) {
            start++;
        }

        if (hasDots) {
            if (i + range >= lastIndex) {
                hideDots = true;
            } else if (i <= end - 2) {
                end -= 2;
            } else {
                start += 1;
                end -= 1;
            }
        }

        return { start, end, hideDots, dotsIndex };
    },

    _calculateMaxItems() {
        const { input, state } = this;
        const items = input.items || [];

        if (!items.some((item) => !item.type)) {
            return;
        }

        const itemContainer = this.getEl('items');
        const itemWidth =
            this._itemWidth || // Cache the item width since it should be static.
            (this._itemWidth = itemContainer.firstElementChild.offsetWidth);

        state.maxItems = Math.max(
            MIN_PAGES,
            Math.min(MAX_PAGES, Math.floor(getMaxWidth(itemContainer) / itemWidth))
        );
    },
};

/**
 * Calculates the maximum width for an element within its container.
 * Works my making the element as large as possible, reading its width,
 * and then restoring its original width.
 *
 * @param {HTMLElement} el the element to get the max width for
 * @return {number}
 */
function getMaxWidth(el) {
    el.style.width = '100vw';
    const result = el.offsetWidth;
    el.style.width = null;
    return result;
}
