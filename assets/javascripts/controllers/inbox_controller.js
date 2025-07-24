(() => {
  const application = Stimulus.Application.start()

  application.register("inbox", class extends Stimulus.Controller {
    static get targets() {
      return [ "list", "detail", "item" ]
    }

    show(event) {
      const el = event.currentTarget
      this.selectItem(el)
      this.showByElement(el)
    }

    selectItem(selected) {
      this.itemTargets.forEach(item => {
        item.classList.remove("bg-blue-50")
        item.classList.add("bg-white")
      })
      selected.classList.remove("bg-white")
      selected.classList.add("bg-blue-50")
    }


    showByElement(el) {
      const id = el.dataset.inboxIdParam

      fetch(`/my-space/inbox/${id}.js`, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
      })
        .then(response => response.text())
        .then(html => {
          this.detailTarget.innerHTML = html
        })
    }
  })
})()