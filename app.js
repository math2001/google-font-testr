"use strict";

;(function () {

const POPUP_ID = 'google-font-testr-popup'
const FONT_LOADER_ID = 'google-font-testr-font-loader'
const STYLE_SHEET_ID = 'google-font-testr-style-sheet'

const POPUP_STYLE = `
#${POPUP_ID} {
    position: fixed;
    top: 10px;
    right: 10px;
    background-color: white;
    color: #333;
    box-shadow: 0 0 50px #C2C2C2;
    font-family: Roboto;
    padding: 30px;
    text-align: center;
}

input {
    border: none;
    background: none;
    font-family: inherit;
    font-size: 100%;
    border-bottom: 2px solid #aaa;
    font-family: "Inconsolata", "Monaco", "consolas", monospace;
}

p {
    position: relative;
}

.count {
    color: #848484;
}

.filters {
    padding: 0;
    list-style: none;
}

.filters li {
    display: inline-block;
    margin: 0 20px;
}

button.change {
    position: absolute;
}

button.change.left {
    left: 10px;
}

button.change.right {
    right: 10px;
}

input[type=checkbox] {
    position: absolute;
    top: -100%;
    left: -100%;
    opacity: 0;
    transform: scale(0);
}

.checkbox.tick {
    display: inline-block;
    width: 19px;
    height: 19px;
    border-radius: 3px;
    vertical-align: middle;
    position: relative;
    border: 2px solid #888;
    transition: all .3s;
}

.checkbox.tick::before {
    content: attr(data-label);
    display: inline-block;
    font-family: Inconsolata, Monaco, consolas, monospace;
    font-size: 70%;
    white-space: nowrap;
    position: absolute;
    left: 50%;
    transform: translate(-50%) scale(.8);
    opacity: 0;
    color: #555;
    transition: all .3s;
}

.checkbox.tick:hover::before {
    transform: translate(-50%, -120%) scale(1);
    opacity: 1;
}

.checkbox.tick::after {
    content: "";
    display: block;
    position: absolute;
    left: 3px;
    top: 3px;
    width: 5px;
    height: 2px;
    border: 2px solid white;
    border-top-color: transparent;
    border-right-color: transparent;
    transform: rotate(-45deg);
    opacity: 0;
}

input[type=checkbox]:checked + .checkbox.tick::after {
    opacity: 1;
}

input[type=checkbox]:checked + .checkbox.tick {
    background-color: #FD5C4C;
    border-color: #FD5C4C;
}
`.replace(/}\n\n/g, `\}\n\n#${POPUP_ID} `)

const POPUP_TEMPLATE = `
<label for="gft-css-selector">CSS selector</label> <input id="gft-css-selector" value="body">
<form id="gft-filters">
    <ul class="filters">
        <li>
            <input type="checkbox" id="gft-monospace" checked>
            <label class="checkbox tick" for="gft-monospace" data-label="Monospace"></label>
        </li>
        <li>
            <input type="checkbox" id="gft-serif" checked>
            <label class="checkbox tick" for="gft-serif" data-label="Serif"></label>
        </li>
        <li>
            <input type="checkbox" id="gft-sans-serif" checked>
            <label class="checkbox tick" for="gft-sans-serif" data-label="Sans Serif"></label>
        </li>
        <li>
            <input type="checkbox" id="gft-handwriting" checked>
            <label class="checkbox tick" for="gft-handwriting" data-label="Hand writing"></label>
        </li>
        <li>
            <input type="checkbox" id="gft-display" checked>
            <label class="checkbox tick" for="gft-display" data-label="Display"></label>
        </li>
    </ul>
</form>
<p>
    <button id="gft-prev" class="change left">&lt;</button>
    <span id="gft-current">Loading...</span>
    <button id="gft-next" class="change right">&gt;</button>
</p>
<p class="count"><span id="gft-index">0</span>/<span id="gft-length">0</span></p>
`.replace(/gft/g, 'google-font-testr')

function removeListener(el) {
    let newEl = el.cloneNode(true)
    el.parentNode.replaceChild(newEl, el)
    return newEl
}

class Popup {

    constructor() {
        this.popup = this.getPopup()
    }

    createPopup() {
        const popup = document.createElement('div')
        popup.id = POPUP_ID
        popup.innerHTML = `<div id="${POPUP_ID}">${POPUP_TEMPLATE}</div>`
        return document.body.appendChild(popup)
    }

    createStyle() {
        const style = document.createElement('style')
        style.type = 'text/css'
        style.innerHTML = POPUP_STYLE
        document.head.appendChild(style)
    }

    getPopup() {
        const popup = document.getElementById(POPUP_ID)
        if (popup === null) {
            this.createStyle()
            return this.createPopup()
        }
        return popup
    }
}

class FontManager {

    constructor() {
        this.fontLoaderTag = this.getFontLoader()
        this.stylesheet = this.getStylesheet()
    }

    getStylesheet() {
        return document.head.querySelector('#' + STYLE_SHEET_ID) || this.createStylesheet()
    }

    createStylesheet() {
        const stylesheet = document.createElement('style')
        stylesheet.type = 'text/css'
        stylesheet.id = STYLE_SHEET_ID
        return document.head.appendChild(stylesheet)
    }

    getFontLoader() {
        const fontLoader = document.getElementById(FONT_LOADER_ID)
        if (fontLoader === null) {
            return this.createFontLoader()
        }
        return fontLoader
    }

    createFontLoader() {
        // create a <link> tag which is used to load the font
        const fontLoader = document.createElement('link')
        fontLoader.rel = 'stylesheet'
        fontLoader.id = FONT_LOADER_ID
        document.head.appendChild(fontLoader)
        return fontLoader
    }

    _load(fontFamilies) {
        if (typeof fontFamilies === 'string') {
            fontFamilies = [fontFamilies]
        }
        fontFamilies = fontFamilies.join('|').replace(/ /g, '+')
        this.fontLoaderTag.href = `https://fonts.googleapis.com/css?family=${fontFamilies}`
    }

    use(selector, ...fonts) {
        this._load(...fonts)
        fonts = fonts.map(font =>
            !(`"'`.includes(font[0]) && `"'`.includes(font.slice(-1))) ? `"${font}"` : font).join(',')
        this.stylesheet.innerHTML = `${selector} { font-family: ${fonts} !important; }`
    }
}

class App {

    constructor() {
        this.fontManager = new FontManager()
        this.popup = new Popup()
        this.fontIndex = 0
        this.cacheDOM()
        fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB-dfCPNmFMEnuaXLKN-zIr-5xwgdEvzGI')
            .then(response => response.json())
            .then(json => {
                this.all_fonts = json.items
                this.fonts = this.filter(this.all_fonts)
                this.updateFont()
                this.bindDOM()
                this.lengthEl.textContent = this.fonts.length
            })
    }

    filter(fonts) {
        return fonts
    }

    cacheDOM() {
        this.current = this.popup.popup.querySelector('#google-font-testr-current')
        this.next = this.popup.popup.querySelector('#google-font-testr-next')
        this.prev = this.popup.popup.querySelector('#google-font-testr-prev')
        this.indexEl = this.popup.popup.querySelector('#google-font-testr-index')
        this.lengthEl = this.popup.popup.querySelector('#google-font-testr-length')
        this.cssSelectorInput = this.popup.popup.querySelector('#google-font-testr-css-selector')
        this.filtersForm = this.popup.popup.querySelector('#google-font-testr-filters')
    }

    _increaseIndex(e) {
        if (e.ctrlKey === true) {
            this.fontIndex += 10
        } else if (e.shiftKey === true) {
            this.fontIndex += 100
        } else {
            this.fontIndex += 1
        }
        if (this.fontIndex >= this.fonts.length) {
            this.fontIndex = 0
        }
        this.updateFont()
    }

    _decreaseIndex(e) {
        if (e.ctrlKey === true) {
            this.fontIndex -= 10
        } else if (e.shiftKey === true) {
            this.fontIndex -= 100
        } else {
            this.fontIndex -= 1
        }
        if (this.fontIndex < 0) {
            this.fontIndex = this.fonts.length - 1
        }
        this.updateFont()
    }

    bindDOM() {
        this.next = removeListener(this.next)
        this.prev = removeListener(this.prev)
        this.cssSelectorInput = removeListener(this.cssSelectorInput)
        this.filtersForm = removeListener(this.filtersForm)

        this.next.addEventListener('click', this._increaseIndex.bind(this))
        this.prev.addEventListener('click', this._decreaseIndex.bind(this))
        this.cssSelectorInput.addEventListener('input', this.updateFont.bind(this))
        this.filtersForm.addEventListener('change', this.updateFilters.bind(this))
    }

    updateFilters() {

    }

    updateFont() {
        const fontFamily = this.fonts[this.fontIndex].family
        this.fontManager.use(this.cssSelectorInput.value, fontFamily)
        this.current.textContent = fontFamily
        this.indexEl.textContent = this.fontIndex + 1
    }

}

new App()

})();
