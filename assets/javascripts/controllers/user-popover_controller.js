(() => {
  const application = Stimulus.Application.start()

  application.register("user-popover", class extends Stimulus.Controller {
    static get targets() {
      return [ "card", "content" ]
    }

    static get values() { 
      return {url: String}
    }

    async show(event) {
      let content = null
      content = await this.fetch()
      
      if (!content) return
  
      const fragment = document.createRange().createContextualFragment(content)
      event.target.appendChild(fragment)
    }
  
    async hide () {
      if (this.hasCardTarget) {
        this.cardTarget.remove()
      }else{
        // wait to let the show/fetch finish
        await this._sleep(300)
        this.hide()
      }
    }
  
    async fetch () {
      if (!this.remoteContent) {
  
        if (!this.hasUrlValue) {
          console.error('[stimulus-popover] You need to pass an url to fetch the popover content.')
          return
        }
  
        const response = await fetch(this.urlValue)
        this.remoteContent = await response.text()
      }
  
      return this.remoteContent
    }

    _sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

  })
})()