"use strict";



if (window.app === undefined) {
// start create App instance

function loadFonts() {
    return fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB-dfCPNmFMEnuaXLKN-zIr-5xwgdEvzGI')
            .then(response => response.json())
}
const POPUP_ID = 'google-font-testr-popup'
const POPUP_TEMPLATE = `
<label for="gft-css-selector">CSS selector</label> <input id="gft-css-selector" value="body">
<form id="gft-filters">
    <ul class="filters">
        <li>
            <input type="checkbox" id="gft-monospace" checked>
            <label class="checkbox tick" for="gft-monospace"></label>
            <label for="gft-monospace">Monospace</label>
        </li>
        <li>
            <input type="checkbox" id="gft-serif" checked>
            <label class="checkbox tick" for="gft-serif"></label>
            <label for="gft-serif">Serif</label>
        </li>
        <li>
            <input type="checkbox" id="gft-sans-serif" checked>
            <label class="checkbox tick" for="gft-sans-serif"></label>
            <label for="gft-sans-serif">Sans Serif</label>
        </li>
        <li>
            <input type="checkbox" id="gft-handwriting" checked>
            <label class="checkbox tick" for="gft-handwriting"></label>
            <label for="gft-handwriting">Hand writing</label>
        </li>
        <li>
            <input type="checkbox" id="gft-display" checked>
            <label class="checkbox tick" for="gft-display"></label>
            <label for="gft-display">Display</label>
        </li>
    </ul>
</form>
<p>
    <button id="gft-prev" class="change left">&lt;</button>
    <span id="gft-current">Loading fonts...</span>
    <button id="gft-next" class="change right">&gt;</button>
</p>
<p class="count"><span id="gft-index">0</span>/<span id="gft-length">0</span></p>
`.replace(/gft/g, 'google-font-testr')

class FontManager {

    constructor() {
        this.fontLoaderTag = this.createFontLoader()
        this.stylesheet = this.createStylesheet()
    }

    createStylesheet() {
        const stylesheet = document.createElement('style')
        stylesheet.type = 'text/css'
        return document.head.appendChild(stylesheet)
    }

    createFontLoader() {
        // create a <link> tag which is used to load the font
        const fontLoader = document.createElement('link')
        fontLoader.rel = 'stylesheet'
        document.head.appendChild(fontLoader)
        return fontLoader
    }

    _load(...fontFamilies) {
        fontFamilies = fontFamilies.join('|').replace(/ /g, '+')
        this.fontLoaderTag.href = `https://fonts.googleapis.com/css?family=${fontFamilies}`
    }

    use(selector, ...fonts) {
        this._load(...fonts)
        fonts = fonts.map(font =>
            !(`"'`.includes(font[0]) && `"'`.includes(font.slice(-1))) ? `"${font}"` : font).join(',')
        this.stylesheet.innerHTML = `${selector} { font-family: ${fonts} !important; }`
    }

    reset() {
        this.stylesheet.innerHTML = ''
        this.fontLoaderTag.href = ''
    }
}

class App {

    constructor() {

        this.popup = document.createElement('div')
        this.popup.id = POPUP_ID
        this.popup.innerHTML = POPUP_TEMPLATE
        document.body.appendChild(this.popup)

        this.cacheDOM()

        loadFonts().then(fonts => {
            this.all_fonts = fonts['items']
            this.fonts = this.filter(this.all_fonts)
            this.fontIndex = 0
            this.bindDOM()
            this.updateFont()
        })

        this.fontManager = new FontManager()
    }

    cacheDOM() {
        this.next = this.popup.querySelector('#google-font-testr-next')
        this.prev = this.popup.querySelector('#google-font-testr-prev')

        this.indexEl = this.popup.querySelector('#google-font-testr-index')
        this.lengthEl = this.popup.querySelector('#google-font-testr-length')

        this.currentFont = this.popup.querySelector('#google-font-testr-current')
        this.cssSelector = this.popup.querySelector('#google-font-testr-css-selector')

        this.filtersForm = this.popup.querySelector('#google-font-testr-filters')

        this.filters = {
            'monospace': this.filtersForm.querySelector('#google-font-testr-monospace'),
            'serif': this.filtersForm.querySelector('#google-font-testr-serif'),
            'handwriting': this.filtersForm.querySelector('#google-font-testr-handwriting'),
            'sans-serif': this.filtersForm.querySelector('#google-font-testr-sans-serif'),
            'display': this.filtersForm.querySelector('#google-font-testr-display')
        }
    }

    bindDOM() {
        this.next.addEventListener('click', e => {
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
        })

        this.prev.addEventListener('click', e => {
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
        })

        this.filtersForm.addEventListener('change', _ => {
            this.fonts = this.filter(this.all_fonts)
            this.updateFont()
        })

        this.cssSelector.addEventListener('input', _ => {
            this.updateFont()
        })
    }

    togglePopup() {
        this.popup.classList.toggle('active')
    }

    filter(fonts) {
        fonts = this.all_fonts.filter(font => this.filters[font.category].checked)
        this.lengthEl.textContent = fonts.length
        this.fontIndex = 0
        return fonts
    }

    updateFont() {
        // update the font index, font name, etc
        this.indexEl.textContent = this.fontIndex + 1
        if (this.fonts.length == 0) {
            this.currentFont.textContent = 'No font found...'
            this.fontManager.reset()
        } else {
            this.currentFont.textContent = this.fonts[this.fontIndex].family
            this.fontManager.use(this.cssSelector.value, this.fonts[this.fontIndex].family)
        }


    }

}

window.app = new App()

} // end creating App instance

app.togglePopup()
