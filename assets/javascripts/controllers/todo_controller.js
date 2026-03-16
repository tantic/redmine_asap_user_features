(async function () {
  // Wait for Stimulus application to be available
  while (typeof Stimulus === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Import Controller from Stimulus module
  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("todo", class extends Controller {
    static targets = [ "issue", "modal", "modalBody", "app", "listmenu", "issuePanel", "issuePanelBody" ]

    static values = {
      newlist: String,
      updatelist: String
    }

    connect(){
      this.newListContent = null
      this._currentIssueId = null
    }

    completeIssue(event) {
      event.stopPropagation();
      const checkbox = event.target;
      const issueId = checkbox.dataset.issueId;

      fetch(`/my-space/todo/issue/${issueId}/complete`, {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
          'Content-Type': 'application/json'
        },
      })
      .then(response => {
        if (response.ok) {
          const card = checkbox.closest('div[data-issue-id]');
          // Ferme le panneau si c'est l'issue affichée
          if (this._currentIssueId == issueId) {
            this.closePanel();
          }
          card.remove();
        } else {
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
      let content = await this.fetchNewList()
      if (!content) return

      const fragment = document.createRange().createContextualFragment(content)
      this.appTarget.appendChild(fragment);
      this.dismissOnClick(this.modalTarget, this.modalBodyTarget);
    }

    async updateList(event){
      let content = await this.fetchUpdateList(event)
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

    // --- Panneau de détail issue ---

    showIssueDetail(event) {
      // Ne pas ouvrir si clic sur la checkbox
      if (event.target.type === 'checkbox') return;

      const card = event.currentTarget;
      const issueId = card.dataset.issueId;
      if (!issueId) return;

      this._currentIssueId = issueId;
      this.loadIssuePanel(issueId);

      // Marquer la carte active
      this.issueTargets.forEach(i => i.classList.remove('ring-2', 'ring-blue-400'));
      card.classList.add('ring-2', 'ring-blue-400');
    }

    async loadIssuePanel(issueId) {
      this.issuePanelBodyTarget.innerHTML = '<div class="p-8 text-center text-gray-400 text-sm">Chargement...</div>';
      this.openPanel();

      try {
        const response = await fetch(`/my-space/todo/issue/${issueId}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/javascript, text/html'
          }
        });

        if (response.ok) {
          const html = await response.text();
          this.issuePanelBodyTarget.innerHTML = html;
        } else {
          this.issuePanelBodyTarget.innerHTML = '<div class="p-8 text-center text-red-500 text-sm">Erreur lors du chargement.</div>';
        }
      } catch (e) {
        this.issuePanelBodyTarget.innerHTML = '<div class="p-8 text-center text-red-500 text-sm">Erreur de connexion.</div>';
      }
    }

    openPanel() {
      this.issuePanelTarget.classList.remove('translate-x-full');
      this.issuePanelTarget.classList.add('translate-x-0');
    }

    closePanel() {
      this.issuePanelTarget.classList.remove('translate-x-0');
      this.issuePanelTarget.classList.add('translate-x-full');
      this._currentIssueId = null;
      // Retirer la surbrillance des cartes
      this.issueTargets.forEach(i => i.classList.remove('ring-2', 'ring-blue-400'));
    }

    // Appelé quand field-edit:saved bubble depuis le panneau
    fieldEditSaved(event) {
      const { issueId, field, value, newListId, priorityLevel } = event.detail;
      if (field === 'fixed_version_id' && newListId) {
        this.moveCardToList(issueId, newListId);
      }
      if (field === 'done_ratio') {
        this.updateCardProgress(issueId, value);
      }
      if (field === 'priority_id' && priorityLevel) {
        this.updateCardPriority(issueId, priorityLevel);
      }
    }

    moveCardToList(issueId, newListId) {
      const card = this.issueTargets.find(el => el.dataset.issueId == issueId);
      const targetColumn = this.element.querySelector(`[data-sortable-list-id-value="${newListId}"]`);
      if (card && targetColumn) {
        targetColumn.appendChild(card);
      }
    }

    updateCardProgress(issueId, ratio) {
      const card = this.issueTargets.find(el => el.dataset.issueId == issueId);
      if (!card) return;
      const bar = card.querySelector('[data-progress-bar] div');
      if (bar) bar.style.width = ratio + '%';
    }

    updateCardPriority(issueId, priorityLevel) {
      const card = this.issueTargets.find(el => el.dataset.issueId == issueId);
      if (!card) return;
      const colorMap = {
        low:    '#9ca3af',
        normal: '#60a5fa',
        high:   '#fb923c',
        urgent: '#ef4444'
      };
      const color = colorMap[priorityLevel];
      if (color) card.style.borderLeft = `4px solid ${color}`;
      if (priorityLevel === 'urgent') {
        const column = card.closest('[data-sortable-list-id-value]');
        if (column) column.prepend(card);
      }
    }

    async addNote(event) {
      event.preventDefault();
      const form = event.target;
      const issueId = form.dataset.todoIssueId;
      const formData = new FormData(form);

      try {
        const response = await fetch(`/my-space/todo/issue/${issueId}/note`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/html'
          },
          body: formData
        });

        if (response.ok) {
          const html = await response.text();
          this.issuePanelBodyTarget.innerHTML = html;
          this.incrementCardNoteCount(issueId);
        } else {
          alert("Erreur lors de l'ajout de la note.");
        }
      } catch (e) {
        alert("Erreur de connexion.");
      }
    }

    incrementCardNoteCount(issueId) {
      const card = this.issueTargets.find(el => el.dataset.issueId == issueId);
      if (!card) return;
      const countEl = card.querySelector('[data-note-count]');
      if (countEl) {
        countEl.textContent = parseInt(countEl.textContent) + 1;
      } else {
        const progressRow = card.querySelector('[data-progress-bar]')?.parentElement;
        if (progressRow) {
          progressRow.insertAdjacentHTML('beforeend', `
            <span class="flex items-center gap-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span data-note-count>1</span>
            </span>
          `);
        }
      }
    }

 });

})();
