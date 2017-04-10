"use strict";

;(function () {

const POPUP_ID = 'google-font-testr-popup'
const FONT_LOADER_ID = 'google-font-testr-font-loader'
const STYLE_SHEET_ID = 'google-font-testr-style-sheet'

const POPUP_STYLE = `
#${POPUP_ID} {
    position: fixed;
    top: 0;
    right: 0;
    background-color: white;
    color: #333;
    box-shadow: 0 0 30px #888;
    font-family: Roboto;
}

#${POPUP_ID} input {
    border: none;
    background: none;
    font-family: inherit;
    font-size: 100%;
    border-bottom: 2px solid #aaa;
}
`
// i → id but for the popup
const POPUP_TEMPLATE = `
<input i="css-selector" value="body">
<ul class="filters">
    <li><input type="radio" i="monospace"></li>
    <li><input type="radio" i="serif"></li>
    <li><input type="radio" i="sans-serif"></li>
</ul>
<button i="prev">&lt;</button>
<span i="current">Loading...</span>
<button i="next">&gt;</button>
`

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
        this.fontLoaderTag.href = `//fonts.googleapis.com/css/family=${fontFamilies}`
    }

    use(selector, ...fonts) {
        this._load(...fonts)
        fonts = fonts.map(font =>
            !(`"'`.includes(font[0]) && `"'`.includes(font.slice(-1))) ? `"${font}"` : font).join(',')
        this.stylesheet.innerHTML = `${selector} { font-family: ${fonts} !important; }`
    }

}

const popup = new Popup()
const fontManager = new FontManager()

fontManager.use('body, p', 'BioRhytm', 'consolas')

})();
