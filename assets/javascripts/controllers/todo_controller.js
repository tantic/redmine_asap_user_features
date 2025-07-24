(() => {
  const application = Stimulus.Application.start()

  application.register("todo", class extends Stimulus.Controller {
    static get targets() {
      return [ "issue"]
    }

    connect(){
      console.log("Dans la todo")
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
  })
})()