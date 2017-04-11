"use strict";

if (window.FontManager === undefined) {

chrome.runtime.onMessage.addListener(fontInfos => {

    if (fontInfos === 'reset') {
        window.fontManager.reset()
    } else {
        window.fontManager.use(fontInfos.selector, ...fontInfos.fonts)
    }

})


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

window.fontManager = new FontManager()

}
