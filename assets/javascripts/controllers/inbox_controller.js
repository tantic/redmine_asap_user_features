(async function () {
  // Wait for Stimulus application to be available
  while (typeof Stimulus === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Import Controller from Stimulus module
  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("inbox", class extends Controller {

    static targets = [ "list", "detail", "item" ]

     connect(){
      console.log("Dans la inbox")
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
 });

})();
