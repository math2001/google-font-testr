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
    box-shadow: 0 0 50px #C2C2C2;
    font-family: Roboto;
    padding: 10px;
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

.filters {
    padding: 0;
    list-style: none;
}

.filters li {
    display: inline-block;
    margin: 0 20px;
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
<button i="prev">&lt;</button>
<span i="current">Loading...</span>
<button i="next">&gt;</button>
`.replace(/gft/g, 'google-font-testr')

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

})();
