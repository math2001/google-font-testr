"use strict";

if (window.FontManager === undefined) {

const FONT_LOADER_ID = 'google-font-testr-font-loader'
const STYLE_SHEET_ID = 'google-font-testr-stylesheet'

chrome.runtime.onMessage.addListener(fontInfos => {

    if (fontInfos === 'reset') {
        window.fontManager.reset()
    } else {
        window.fontManager.use(fontInfos.selector, ...fontInfos.fonts)
    }
})

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

    reset() {
        this.stylesheet.innerHTML = ''
        this.fontLoaderTag.href = ''
    }
}


window.fontManager = new FontManager()

}
