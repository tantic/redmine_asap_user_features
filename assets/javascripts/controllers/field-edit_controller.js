(async function () {
  while (typeof Stimulus === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("field-edit", class extends Controller {
    static targets = ["display", "editor", "input"]
    static values = {
      issueId: Number,
      field:   String,
      type:    String   // "text" | "select" | "textarea" | "date" — optionnel
    }

    edit() {
      this.displayTarget.classList.add('hidden!');
      this.editorTarget.classList.remove('hidden!');
      // Focus l'input
      const input = this.inputTarget;
      input.focus();
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }

    cancel() {
      this.editorTarget.classList.add('hidden!');
      this.displayTarget.classList.remove('hidden!');
    }

    async save() {
      const input = this.inputTarget;
      const value = input.value;

      try {
        const response = await fetch(`/my-space/todo/issue/${this.issueIdValue}/field`, {
          method: 'PATCH',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ field: this.fieldValue, value: value })
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          this._updateDisplay(input, value, data);
          this.cancel();
          // Notifie les controllers parents d'un changement de champ
          this.dispatch('saved', {
            bubbles: true,
            detail: {
              issueId: this.issueIdValue,
              field: this.fieldValue,
              value,
              newListId: data.new_list_id,
              priorityLevel: data.priority_level
            }
          });
        } else {
          const data = await response.json().catch(() => ({}));
          const errors = data?.errors?.join(', ') || `Erreur ${response.status}`;
          alert(`Impossible de sauvegarder : ${errors}`);
        }
      } catch (e) {
        alert("Erreur de connexion.");
      }
    }

    // Appui Entrée sur un input texte → sauvegarde ; Échap → annule
    keydown(event) {
      if (event.key === 'Enter' && this.inputTarget.tagName !== 'TEXTAREA') {
        event.preventDefault();
        this.save();
      } else if (event.key === 'Escape') {
        this.cancel();
      }
    }

    _updateDisplay(input, value, data = {}) {
      const display = this.displayTarget;

      if (input.tagName === 'SELECT') {
        const selected = input.options[input.selectedIndex];
        display.textContent = selected ? selected.text : value || '-';
      } else if (this.typeValue === 'textarea') {
        if (data.rendered_html) {
          display.innerHTML = data.rendered_html;
        } else {
          display.textContent = value || '';
        }
      } else {
        display.textContent = value || '-';
      }
    }
  });

})();
