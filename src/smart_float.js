const FLOAT_ELEMENT_HIDDEN_TIEMOUT = 5000;

/**
 * Handles the displayment of the float element
 */
export class FloatElementHandler {
  #floatElement;
  #formElement;
  #formFieldset;
  #isFormEndVisible;
  #timeoutID;
  #isScrollCallbackExecuting;
  #lastScrollTop;
  constructor() {
    this.#floatElement = document.querySelector("[data-float-element]");
    this.#formElement = document.querySelector("[data-form-element]");
    this.#formFieldset = this.#formElement.querySelector("fieldset");
    this.#isFormEndVisible = false;
    this.#timeoutID = -1;
    this.#isScrollCallbackExecuting = false;
    this.#lastScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    this.initEvents();
  }

  /**
   * Initialise events.
   */
  initEvents() {
    this.#formElement?.addEventListener("focusin", this.onFocusIn.bind(this));
    this.#formElement?.addEventListener("focusout", this.onFocusOut.bind(this));

    this.#formElement?.addEventListener("input", this.onInput.bind(this));

    window.addEventListener("scroll", this.onScroll.bind(this));

    const floatElementHeight =
      this.#floatElement?.getBoundingClientRect().height;
    const observerOptions = {
      root: null,
      rootMargin: `0px 0px -${floatElementHeight}px 0px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver(
      this.observerCallback.bind(this),
      observerOptions,
    );

    const endForm = document.querySelector("[data-end-form]");
    endForm && observer.observe(endForm);
  }

  /**
   * Executed when the user performs a scroll on the page.
   *
   * To make it more efficient, a call to requestAnimationFrame is performed to avoid too many calls.
   * Ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#scroll_event_throttling
   */
  onScroll() {
    const scrollCallback = () => {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (
        st > this.#lastScrollTop &&
        !this.#isFormEndVisible &&
        this.hasFocusedElement()
      ) {
        this.hide();
      } else if (st < this.#lastScrollTop) {
        this.show();
      }
      this.#lastScrollTop = st <= 0 ? 0 : st;
    };

    if (!this.#isScrollCallbackExecuting) {
      window.requestAnimationFrame(() => {
        scrollCallback();
        this.#isScrollCallbackExecuting = false;
      });
    }

    this.#isScrollCallbackExecuting = true;
  }

  onInput(event) {
    if (event.detail?.programatically || event.detail?.fromStorage) {
      return;
    }
    this.hide();
  }

  /**
   * Callback to be executed when the shipping methods are visible.
   *
   * @param {Array} entries
   */
  observerCallback(entries) {
    entries.forEach((entry) => {
      this.#isFormEndVisible = entry.isIntersecting;
      if (entry.isIntersecting) {
        this.show();
      } else if (this.hasFocusedElement()) {
        this.hide();
      }
    });
  }

  /**
   *
   * @returns {boolean} true if the active element is an input in the billing or shipping fieldsets.
   */
  hasFocusedElement() {
    return (
      document.activeElement !== this.#formFieldset &&
      document.activeElement !== this.#formFieldset &&
      this.#formElement.contains(document.activeElement)
    );
  }

  /**
   * Executed when there is a focus in on the form
   *
   * @param {Event} event
   */
  onFocusIn(event) {
    if (event.target === this.#formFieldset) {
      return;
    }
    this.hide();
  }

  /**
   * Executed when there is a focus out on the form
   */
  onFocusOut() {
    this.show();
  }

  /**
   * Shows the summary event
   */
  show() {
    this.#floatElement?.classList.remove("form__float-submit--hidden");
  }

  /**
   * Hides the summary element
   */
  hide() {
    if (this.#isFormEndVisible) {
      return;
    }
    window.clearTimeout(this.#timeoutID);
    this.#timeoutID = window.setTimeout(
      this.show.bind(this),
      FLOAT_ELEMENT_HIDDEN_TIEMOUT,
    );
    this.#floatElement?.classList.add("form__float-submit--hidden");
  }
}
