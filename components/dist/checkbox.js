const smCheckbox = document.createElement('template')
smCheckbox.innerHTML = `
<style>
    *{
        padding: 0;
        margin: 0;
        -webkit-box-sizing: border-box;
                box-sizing: border-box;
    } 
    :host{
        display: -webkit-inline-box;
        display: -ms-inline-flexbox;
        display: inline-flex;
        --accent-color: #4d2588;
        --text-color: 17, 17, 17;
        --background-color: 255, 255, 255;
        --height: 1.2rem;
        --width: 1.2rem;
        --border-radius: 0.2rem;
        --border-color: rgba(var(--text-color), 0.7);
    }
    :host([disabled]) {
        opacity: 0.6;
        user-select: none;
        pointer-events: none;
    }
    .checkbox {
        position: relative;
        display:-webkit-box;
        display:-ms-flexbox;
        display:flex;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        cursor: pointer;
        outline: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    .checkbox:focus-visible{
        outline: auto;
    }
    .checkbox:active .icon,
    .checkbox:focus-within .icon{
        box-shadow: 0 0 0 0.1rem var(--accent-color) inset;
    }
    
    input {
        display: none;
    }
    
    .checkmark {
        stroke-dashoffset: -65;
        stroke-dasharray: 65;
        -webkit-transition: stroke-dashoffset 0.3s; 
        -o-transition: stroke-dashoffset 0.3s; 
        transition: stroke-dashoffset 0.3s;
    }
    
    :host([checked]) .checkmark {
        stroke-dashoffset: 0;
        stroke: rgba(var(--background-color), 1);
    }
    :host([checked]) .icon {
        background: var(--accent-color);
        box-shadow: 0 0 0 0.1rem var(--accent-color) inset;
    }    
    .icon {
        fill: none;
        height: var(--height);
        width: var(--width);
        padding: 0.1rem;
        stroke-width: 8; 
        stroke: var(--border-color);
        overflow: visible;
        stroke-linecap: round;
        stroke-linejoin: round;
        -webkit-transition: background 0.3s;
        -o-transition: background 0.3s;
        transition: background 0.3s;
        border-radius: var(--border-radius);
        box-shadow: 0 0 0 0.1rem var(--border-color) inset;
    }
</style>
<label class="checkbox">
    <svg class="icon" viewBox="0 0 64 64">
        <path class="checkmark" d="M50.52,19.56,26,44.08,13.48,31.56" />
    </svg>
    <slot></slot>
</label>`
customElements.define('sm-checkbox', class extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({
            mode: 'open'
        }).append(smCheckbox.content.cloneNode(true))

        this.defaultState
        this.checkbox = this.shadowRoot.querySelector('.checkbox');

        this.reset = this.reset.bind(this)
        this.dispatch = this.dispatch.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    static get observedAttributes() {
        return ['value', 'disabled', 'checked']
    }

    get disabled() {
        return this.hasAttribute('disabled')
    }

    set disabled(val) {
        if (val) {
            this.setAttribute('disabled', '')
        } else {
            this.removeAttribute('disabled')
        }
    }

    get checked() {
        return this.hasAttribute('checked')
    }

    set checked(value) {
        if (value) {
            this.setAttribute('checked', '')
        }
        else {
            this.removeAttribute('checked')
        }
    }

    set value(val) {
        this.setAttribute('value', val)
    }

    get value() {
        return this.getAttribute('value')
    }

    focusIn() {
        this.focus()
    }

    reset() {
        this.value = this.defaultState
    }

    dispatch() {
        this.dispatchEvent(new CustomEvent('change', {
            bubbles: true,
            composed: true
        }))
    }
    handleKeyDown(e) {
        if (e.key === ' ') {
            e.preventDefault()
            this.click()
        }
    }
    handleClick(e) {
        this.toggleAttribute('checked')
    }

    connectedCallback() {
        if (!this.hasAttribute('disabled')) {
            this.setAttribute('tabindex', '0')
        }
        this.setAttribute('role', 'checkbox')
        this.defaultState = this.hasAttribute('checked')
        if (!this.hasAttribute('checked')) {
            this.setAttribute('aria-checked', 'false')
        }
        this.addEventListener('keydown', this.handleKeyDown)
        this.addEventListener('click', this.handleClick)
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'checked') {
                this.setAttribute('aria-checked', this.hasAttribute('checked'))
                this.dispatch()
            }
            else if (name === 'disabled') {
                if (this.hasAttribute('disabled')) {
                    this.removeAttribute('tabindex')
                }
                else {
                    this.setAttribute('tabindex', '0')
                }
            }
        }
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeyDown)
        this.removeEventListener('change', this.handleClick)
    }
})