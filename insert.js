"use strict";



if (window.app === undefined) {
// start create App instance

chrome.tabs.executeScript(null, {code: 'window.FontManager'}, function (results) {
    if (results[0] === null) {
        chrome.tabs.executeScript({
            file: 'listener.js'
        })
    }
})

function loadFonts() {
    return fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB-dfCPNmFMEnuaXLKN-zIr-5xwgdEvzGI')
            .then(response => response.json())
}

class FontManager {

    constructor() {
        this.ready = false
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            this.tabId = tabs[0].id
            this.ready = true
        })
    }

    use(selector, ...fonts) {
        if (this.ready !== true) {
            return false
        }
        chrome.tabs.sendMessage(this.tabId, {selector, fonts})
        return true
    }

    reset() {
        chrome.tabs.sendMessage(null, 'reset')
    }

}

class App {

    constructor() {

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
        this.next = document.querySelector('#next')
        this.prev = document.querySelector('#prev')

        this.indexEl = document.querySelector('#index')
        this.lengthEl = document.querySelector('#length')

        this.currentFont = document.querySelector('#current')
        this.cssSelector = document.querySelector('#css-selector')

        this.filtersForm = document.querySelector('#filters')

        this.filters = {
            'monospace': this.filtersForm.querySelector('#monospace'),
            'serif': this.filtersForm.querySelector('#serif'),
            'handwriting': this.filtersForm.querySelector('#handwriting'),
            'sans-serif': this.filtersForm.querySelector('#sans-serif'),
            'display': this.filtersForm.querySelector('#display')
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
