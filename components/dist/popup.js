class Stack {
    constructor() {
        this.items = [];
    }
    push(element) {
        this.items.push(element);
    }
    pop() {
        if (this.items.length == 0)
            return "Underflow";
        return this.items.pop();
    }
    peek() {
        return this.items[this.items.length - 1];
    }
}
const popupStack = new Stack();

const smPopup = document.createElement('template');
smPopup.innerHTML = `
<style>
*{
    padding: 0;
    margin: 0;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
} 
:host{
    position: fixed;
    display: -ms-grid;
    display: grid;
    z-index: 10;
    --accent-color: #4d2588;
    --text-color: 17, 17, 17;
    --background-color: 255, 255, 255;
    --width: 100%;
    --height: auto;
    --min-width: auto;
    --min-height: auto;
    --backdrop-background: rgba(0, 0, 0, 0.6);
    --border-radius: 0.8rem 0.8rem 0 0;
}
.popup-container{
    display: -ms-grid;
    display: grid;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    place-items: center;
    z-index: 10;
    touch-action: none;
}
:host(.stacked) .popup{
    -webkit-transform: scale(0.9) translateY(-2rem) !important;
            transform: scale(0.9) translateY(-2rem) !important;
}
.background{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    background: var(--backdrop-background);
    -webkit-transition: opacity 0.3s;
    -o-transition: opacity 0.3s;
    transition: opacity 0.3s;
}
.popup{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
            flex-direction: column;
    position: relative;
    -ms-flex-item-align: end;
        align-self: flex-end;
    -webkit-box-align: start;
        -ms-flex-align: start;
            align-items: flex-start;
    width: var(--width);
    min-width: var(--min-width);
    height: var(--height);
    min-height: var(--min-height);
    max-height: 90vh;
    border-radius: var(--border-radius);
    background: rgba(var(--background-color), 1);
    -webkit-box-shadow: 0 -1rem 2rem #00000020;
            box-shadow: 0 -1rem 2rem #00000020;
}
.container-header{
    display: -webkit-box;
    display: flex;
    width: 100%;
    touch-action: none;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
}
.popup-top{
    display: -webkit-box;
    display: flex;
    width: 100%;
}
.popup-body{
    display: -webkit-box;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
        -ms-flex-direction: column;
            flex-direction: column;
    -webkit-box-flex: 1;
        -ms-flex: 1;
            flex: 1;
    width: 100%;
    padding: var(--body-padding, 1.5rem);
    overflow-y: auto;
}
.hide{
    display:none;
}
@media screen and (min-width: 640px){
    :host{
        --border-radius: 0.5rem;
    }
    .popup{
        -ms-flex-item-align: center;
            -ms-grid-row-align: center;
            align-self: center;
        border-radius: var(--border-radius);
        height: var(--height);
        -webkit-box-shadow: 0 3rem 2rem -0.5rem #00000040;
                box-shadow: 0 3rem 2rem -0.5rem #00000040;
    }
}
@media screen and (max-width: 640px){
    .popup-top{
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
                flex-direction: column;
        -webkit-box-align: center;
                align-items: center;
    }
    .handle{
        height: 0.3rem;
        width: 2rem;
        background: rgba(var(--text-color), .4);
        border-radius: 1rem;
        margin: 0.5rem 0;
    }
}
@media (any-hover: hover){
    ::-webkit-scrollbar{
        width: 0.5rem;
    }
    
    ::-webkit-scrollbar-thumb{
        background: rgba(var(--text-color), 0.3);
        border-radius: 1rem;
        &:hover{
            background: rgba(var(--text-color), 0.5);
        }
    }
}
</style>
<div class="popup-container hide" role="dialog">
    <div part="background" class="background"></div>
    <div part="popup" class="popup">
        <div part="popup-header" class="popup-top">
            <div class="handle"></div>
            <slot name="header"></slot>
        </div>
        <div part="popup-body" class="popup-body">
            <slot></slot>
        </div>
    </div>
</div>
`;
customElements.define('sm-popup', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        }).append(smPopup.content.cloneNode(true));

        this.allowClosing = false;
        this.isOpen = false;
        this.pinned = false;
        this.offset = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;
        this.touchEndTime = 0;
        this.touchEndAnimation = undefined;
        this.focusable
        this.autoFocus
        this.mutationObserver

        this.popupContainer = this.shadowRoot.querySelector('.popup-container');
        this.backdrop = this.shadowRoot.querySelector('.background');
        this.popup = this.shadowRoot.querySelector('.popup');
        this.popupBodySlot = this.shadowRoot.querySelector('.popup-body slot');
        this.popupHeader = this.shadowRoot.querySelector('.popup-top');

        this.resumeScrolling = this.resumeScrolling.bind(this);
        this.setStateOpen = this.setStateOpen.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.detectFocus = this.detectFocus.bind(this);
    }

    static get observedAttributes() {
        return ['open'];
    }

    get open() {
        return this.isOpen;
    }

    animateTo(element, keyframes, options) {
        const anime = element.animate(keyframes, { ...options, fill: 'both' })
        anime.finished.then(() => {
            anime.commitStyles()
            anime.cancel()
        })
        return anime
    }

    resumeScrolling() {
        const scrollY = document.body.style.top;
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
        document.body.style.overflow = 'auto';
        document.body.style.top = 'initial';
    }

    setStateOpen() {
        if (!this.isOpen || this.offset) {
            const animOptions = {
                duration: 300,
                easing: 'ease'
            }
            const initialAnimation = (window.innerWidth > 640) ? 'scale(1.1)' : `translateY(${this.offset ? `${this.offset}px` : '100%'})`
            this.animateTo(this.popup, [
                {
                    opacity: this.offset ? 1 : 0,
                    transform: initialAnimation
                },
                {
                    opacity: 1,
                    transform: 'none'
                },
            ], animOptions)

        }
    }

    show(options = {}) {
        const { pinned = false } = options;
        if (!this.isOpen) {
            const animOptions = {
                duration: 300,
                easing: 'ease'
            }
            popupStack.push({
                popup: this,
                permission: pinned
            });
            if (popupStack.items.length > 1) {
                this.animateTo(popupStack.items[popupStack.items.length - 2].popup.shadowRoot.querySelector('.popup'), [
                    { transform: 'none' },
                    { transform: (window.innerWidth > 640) ? 'scale(0.95)' : 'translateY(-1.5rem)' },
                ], animOptions)
            }
            this.popupContainer.classList.remove('hide');
            if (!this.offset)
                this.backdrop.animate([
                    { opacity: 0 },
                    { opacity: 1 },
                ], animOptions)
            this.setStateOpen()
            this.dispatchEvent(
                new CustomEvent("popupopened", {
                    bubbles: true,
                    detail: {
                        popup: this,
                    }
                })
            );
            this.pinned = pinned;
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            document.body.style.top = `-${window.scrollY}px`;
            const elementToFocus = this.autoFocus || this.focusable[0];
            elementToFocus.tagName.includes('SM-') ? elementToFocus.focusIn() : elementToFocus.focus();
            if (!this.hasAttribute('open'))
                this.setAttribute('open', '');
        }
    }
    hide() {
        const animOptions = {
            duration: 150,
            easing: 'ease'
        }
        this.backdrop.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], animOptions)
        this.animateTo(this.popup, [
            {
                opacity: 1,
                transform: (window.innerWidth > 640) ? 'none' : `translateY(${this.offset ? `${this.offset}px` : '0'})`
            },
            {
                opacity: 0,
                transform: (window.innerWidth > 640) ? 'scale(1.1)' : 'translateY(100%)'
            },
        ], animOptions).finished
            .finally(() => {
                this.popupContainer.classList.add('hide');
                this.popup.style = ''
                this.removeAttribute('open');

                if (this.forms.length) {
                    this.forms.forEach(form => form.reset());
                }
                this.dispatchEvent(
                    new CustomEvent("popupclosed", {
                        bubbles: true,
                        detail: {
                            popup: this,
                        }
                    })
                );
                this.isOpen = false;
            })
        popupStack.pop();
        if (popupStack.items.length) {
            this.animateTo(popupStack.items[popupStack.items.length - 1].popup.shadowRoot.querySelector('.popup'), [
                { transform: (window.innerWidth > 640) ? 'scale(0.95)' : 'translateY(-1.5rem)' },
                { transform: 'none' },
            ], animOptions)

        } else {
            this.resumeScrolling();
        }
    }

    handleTouchStart(e) {
        this.offset = 0
        this.popupHeader.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.popupHeader.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        this.touchStartY = e.changedTouches[0].clientY;
        this.touchStartTime = e.timeStamp;
    }

    handleTouchMove(e) {
        if (this.touchStartY < e.changedTouches[0].clientY) {
            this.offset = e.changedTouches[0].clientY - this.touchStartY;
            this.touchEndAnimation = window.requestAnimationFrame(() => {
                this.popup.style.transform = `translateY(${this.offset}px)`;
            });
        }
    }

    handleTouchEnd(e) {
        this.touchEndTime = e.timeStamp;
        cancelAnimationFrame(this.touchEndAnimation);
        this.touchEndY = e.changedTouches[0].clientY;
        this.threshold = this.popup.getBoundingClientRect().height * 0.3;
        if (this.touchEndTime - this.touchStartTime > 200) {
            if (this.touchEndY - this.touchStartY > this.threshold) {
                if (this.pinned) {
                    this.setStateOpen();
                    return;
                } else
                    this.hide();
            } else {
                this.setStateOpen();
            }
        } else {
            if (this.touchEndY > this.touchStartY)
                if (this.pinned) {
                    this.setStateOpen();
                    return;
                }
                else
                    this.hide();
        }
        this.popupHeader.removeEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.popupHeader.removeEventListener('touchend', this.handleTouchEnd, { passive: true });
    }


    detectFocus(e) {
        if (e.key === 'Tab') {
            const lastElement = this.focusable[this.focusable.length - 1];
            const firstElement = this.focusable[0];
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.tagName.includes('SM-') ? lastElement.focusIn() : lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.tagName.includes('SM-') ? firstElement.focusIn() : firstElement.focus();
            }
        }
    }

    updateFocusableList() {
        this.focusable = this.querySelectorAll('sm-button:not([disabled]), button:not([disabled]), [href], sm-input, input, sm-select, select, sm-checkbox, sm-textarea, textarea, [tabindex]:not([tabindex="-1"])')
        this.autoFocus = this.querySelector('[autofocus]')
    }

    connectedCallback() {
        this.popupBodySlot.addEventListener('slotchange', () => {
            this.forms = this.querySelectorAll('sm-form');
            this.updateFocusableList()
        });
        this.popupContainer.addEventListener('mousedown', e => {
            if (e.target === this.popupContainer && !this.pinned) {
                if (this.pinned) {
                    this.setStateOpen();
                } else
                    this.hide();
            }
        });

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentBoxSize) {
                    // Firefox implements `contentBoxSize` as a single content rect, rather than an array
                    const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
                    this.threshold = contentBoxSize.blockSize.height * 0.3;
                } else {
                    this.threshold = entry.contentRect.height * 0.3;
                }
            }
        });
        resizeObserver.observe(this);

        this.mutationObserver = new MutationObserver(entries => {
            this.updateFocusableList()
        })
        this.mutationObserver.observe(this, { attributes: true, childList: true, subtree: true })

        this.addEventListener('keydown', this.detectFocus);
        this.popupHeader.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this.detectFocus);
        resizeObserver.unobserve();
        this.mutationObserver.disconnect()
        this.popupHeader.removeEventListener('touchstart', this.handleTouchStart, { passive: true });
    }
    attributeChangedCallback(name) {
        if (name === 'open') {
            if (this.hasAttribute('open')) {
                this.show();
            }
        }
    }
});