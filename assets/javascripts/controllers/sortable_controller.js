(() => {
  const application = Stimulus.Application.start()

  application.register("sortable", class extends Stimulus.Controller {

    static get values() {
      return {
        listId: Number
      }
    }


    connect() {
      this.sortable = new window.Sortable(this.element, {
        group: 'issues',
        animation: 150,
        ghostClass: 'bg-yellow-100',
        onAdd: this.onDrop.bind(this),
        onUpdate: this.onReorder.bind(this)
      })
    }

    onDrop(event) {
      const issueId = event.item.dataset.issueId
      const newListId = this.listIdValue
      const orderedIds = Array.from(this.element.children).map(el => el.dataset.issueId)

      fetch(`/my-space/todo/issue/${issueId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          list_id: newListId,
          ordered_ids: orderedIds
        })
      })
    }

    onReorder(event) {
      const orderedIds = Array.from(this.element.children).map(el => el.dataset.issueId)

      fetch(`/my-space/todo/list/${this.listIdValue}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ ordered_ids: orderedIds })
      })
    }

    disconnect() {
      if (this.sortable) this.sortable.destroy()
    }
  })
})()



