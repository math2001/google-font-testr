"use strict";

const DEV = true

// insert only once listener.js
chrome.tabs.executeScript(null, {code: 'window.FontManager'}, function (results) {
    if (results[0] === null) {
        chrome.tabs.executeScript({
            file: 'listener.js'
        })
    }
})

function loadFonts() {
    if (DEV) {
        // just save the response of the URL *below* to a file called webfonts.json
        // at the root of this extension, and set DEV to true
        return fetch('webfonts.json').then(response => response.json())
    }
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
        chrome.tabs.sendMessage(this.tabId, 'reset')
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

        this.resetButton = document.querySelector('#reset')

        this.filters = {
            'monospace': this.filtersForm.querySelector('#monospace'),
            'serif': this.filtersForm.querySelector('#serif'),
            'handwriting': this.filtersForm.querySelector('#handwriting'),
            'sans-serif': this.filtersForm.querySelector('#sans-serif'),
            'display': this.filtersForm.querySelector('#display')
        }
    }

    nextFont(e) {
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

    prevFont(e) {
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
        this.next.addEventListener('click', this.nextFont.bind(this))

        this.prev.addEventListener('click', e => this.prevFont.bind(this))

        this.filtersForm.addEventListener('change', _ => {
            this.fonts = this.filter(this.all_fonts)
            this.updateFont()
        })

        this.cssSelector.addEventListener('input', _ => {
            this.updateFont()
        })

        this.resetButton.addEventListener('click', _ => {
            this.fontManager.reset()
        })

        document.body.addEventListener('keydown', e => {
            if (document.activeElement !== document.body) {
                return
            }
            if (e.keyCode == 39) {
                this.nextFont(e)
            } else if (e.keyCode == 37) {
                this.prevFont(e)
            }
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
            this.currentFont.value = 'No font found...'
            this.currentFont.disabled = true
            this.fontManager.reset()
        } else {
            this.currentFont.value = this.fonts[this.fontIndex].family
            this.fontManager.use(this.cssSelector.value, this.fonts[this.fontIndex].family)
            this.currentFont.disabled = false
        }


    }

}

new App()
