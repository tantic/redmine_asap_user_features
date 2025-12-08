(async function () {
  // Wait for Stimulus application to be available
  while (typeof Stimulus === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Import Controller from Stimulus module
  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("todo", class extends Controller {
    static targets = [ "issue", "modal", "modalBody","app", "listmenu"]

    static values = {
      newlist: String,
      updatelist: String
    }

    connect(){
      console.log("Dans la todo")
      this.newListContent = null
    }

    completeIssue(event) {
      const checkbox = event.target;
      const issueId = checkbox.dataset.issueId;

      // Envoi la requête PATCH pour clôturer l'issue côté serveur
      fetch(`/my-space/todo/issue/${issueId}/complete`, {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Content-Type': 'application/json'
        },
        // Pas besoin de body si juste une clôture
      })
      .then(response => {
        if (response.ok) {
          // Retire l'élément de la vue côté client
          // Remonte jusqu'à la div englobante de l'issue
          checkbox.closest('div[data-issue-id]').remove();
        } else {
          // Affiche une erreur ou remets la checkbox
          checkbox.checked = false;
          alert("Erreur lors de la clôture.");
        }
      })
      .catch(() => {
        checkbox.checked = false;
        alert("Erreur de connexion.");
      });
    }


    async newList(){
      console.log("Ajout d'une liste "+this.newlistValue)
      let content = null
      content = await this.fetchNewList()

      if (!content) return

      const fragment = document.createRange().createContextualFragment(content)
      this.appTarget.appendChild(fragment);
      this.dismissOnClick(this.modalTarget, this.modalBodyTarget);
    }

    async updateList(event){
      console.log("Modification d'une liste "+this.updatelistValue)
      let content = null
      content = await this.fetchUpdateList(event)

      if (!content) return

      const fragment = document.createRange().createContextualFragment(content)
      this.appTarget.appendChild(fragment);
      this.dismissOnClick(this.modalTarget, this.modalBodyTarget);
    }

    hide(){
      this.modalTarget.remove();
    }

    async fetchNewList () {
      if (!this.newListContent) {
        if (!this.hasNewlistValue) {
          console.error('You need to pass an url to fetch the content.')
          return
        }

        const response = await fetch(this.newlistValue)
        this.newListContent = await response.text()
      }

      return this.newListContent
    }

    async fetchUpdateList (event) {
      if (!this.updateListContent) {
        const url = event.currentTarget.dataset.url
        console.log("URL à fetch:", url)
        if (!url) {
          console.error('You need to pass an url to fetch the content.')
          return
        }

        const response = await fetch(url)
        this.updateListContent = await response.text()
      }

      return this.updateListContent
    }

    showAdminList(event) {
      event.stopPropagation();

      const button = event.currentTarget;
      const container = button.closest('.flex');
      const menu = container.querySelector('[data-todo-target="listmenu"]');
      this.listmenuTargets.forEach(m => m.classList.add('hidden'));
      menu.classList.toggle('hidden');

      this.dismissOnClick(menu);
    }

    dismissOnClick(element) {
      document.addEventListener('click', (evt) => {
        var isClickInside = element.contains(evt.target);
        if (!isClickInside) {
          element.classList.add('hidden')
        }
      },
      { once: true, capture: true }
     );
    }


 });

})();
