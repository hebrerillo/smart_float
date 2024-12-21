const FLOAT_ELEMENT_HIDDEN_TIEMOUT = 5000;

/**
 * Handles the displayment of the float element
 */
export class FloatElementHandler {
  #floatElement;
  #formElement;
  #formFieldset;
  #isFormEndVisible;
  #hiddenTimeoutID; //The timeout ID returned when hidding the floating element.
  #isScrollCallbackExecuting;
  #lastScrollTop;
  constructor() {
    this.#floatElement = document.querySelector("[data-float-element]");
    this.#formElement = document.querySelector("[data-form-element]");
    this.#formFieldset = this.#formElement.querySelector("fieldset");
    this.#isFormEndVisible = false;
    this.#hiddenTimeoutID = -1;
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
    this.#formElement?.addEventListener("click", this.onFormClick.bind(this));
    window.addEventListener("scroll", this.onScroll.bind(this));
    this.configureFormEndObserver();
  }

  /**
   * Configures an observer that will check the visibility of the end of the form.
   */
  configureFormEndObserver() {
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
      if (st > this.#lastScrollTop && this.hasFocusedElement()) {
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

  /**
   * Event function to handle click events on the form
   *
   * @param {Event} event
   */
  onFormClick(event) {
    const target = event.target;
    if (this.isFormElementTriggeringKeyboard(target)) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Checks if focusing or clicking 'element' will cause the mobile keyboard
   * to show up.
   *
   * @param {HTMLElement} element An HTML element (most likely, a HTMLInputElement)
   * @returns {boolean} true if clicking or focusing on element will cause the mobile keyboard to show up, false otherwise
   */
  isFormElementTriggeringKeyboard(element) {
    const type = element.type ?? "";
    switch (type) {
      case "text":
      case "password":
      case "search":
      case "email":
      case "number":
      case "tel":
      case "url":
        return true;
      default:
        return false;
    }
  }

  /**
   * Executed when there is an input on the form.
   */
  onInput() {
    this.hide();
  }

  /**
   * Handles the visibility of the floating element when the end of the form is hidden/visible.
   *
   * If the end of the form is visible, the floating element should be visible. The height of the floating element is substracted
   * so that it never hides any form input element.
   *
   * If the end of the form is not visible, the floating element should be hidden only if the focused element is a form element.
   *
   * @param {Array} entries The intersection entries.
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
   * Shows the floating event
   */
  show() {
    this.#floatElement?.classList.remove("form__float-submit--hidden");
  }

  /**
   * Hides the floating element only if the end of the form is not visible.
   * The floating element is not hidden forever. If there is an inactivity of FLOAT_ELEMENT_HIDDEN_TIEMOUT milliseconds, the
   * floating element will be shown again.
   */
  hide() {
    if (this.#isFormEndVisible) {
      return;
    }
    window.clearTimeout(this.#hiddenTimeoutID);
    this.#hiddenTimeoutID = window.setTimeout(
      this.show.bind(this),
      FLOAT_ELEMENT_HIDDEN_TIEMOUT,
    );
    this.#floatElement?.classList.add("form__float-submit--hidden");
  }
}
