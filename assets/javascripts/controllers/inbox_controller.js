(async function () {
  // Wait for Stimulus application to be available
  while (typeof Stimulus === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Import Controller from Stimulus module
  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("inbox", class extends Controller {

    static targets = [ "list", "detail", "item", "searchInput", "loadMore" ]

    connect(){
      this._currentIssueId = null;
      this._loading = false;
    }

    async loadMore() {
      if (this._loading || !this.hasLoadMoreTarget) return;
      const el = this.loadMoreTarget;
      const source = el.dataset.source || 'index';
      const offset = parseInt(el.dataset.offset || '50', 10);
      this._loading = true;
      const btn = el.querySelector('button');
      if (btn) btn.textContent = 'Chargement…';
      try {
        const res = await fetch(`/my-space/inbox/list?source=${encodeURIComponent(source)}&offset=${offset}`, {
          headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' }
        });
        if (!res.ok) return;
        const data = await res.json();
        el.insertAdjacentHTML('beforebegin', data.html);
        el.dataset.offset = String(offset + 50);
        if (!data.has_more) {
          el.classList.add('hidden');
        } else if (btn) {
          btn.textContent = 'Charger 50 de plus';
        }
      } catch(e) {
        console.error('Erreur chargement inbox', e);
        if (btn) btn.textContent = 'Charger 50 de plus';
      } finally {
        this._loading = false;
      }
    }

    show(event) {
      const el = event.currentTarget
      this._currentIssueId = el.dataset.inboxIdParam
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

    // Appelé quand field-edit:saved bubble depuis le panneau de détail
    fieldEditSaved() {
      this.refreshList();
    }

    async refreshList() {
      try {
        const source = this.hasLoadMoreTarget ? (this.loadMoreTarget.dataset.source || 'index') : 'index';
        const response = await fetch(`/my-space/inbox/list?source=${encodeURIComponent(source)}`, {
          headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'text/html' }
        });
        if (!response.ok) return;
        const html = await response.text();
        this.listTarget.innerHTML = html;
        // Réinitialise la pagination
        if (this.hasLoadMoreTarget) {
          const el = this.loadMoreTarget;
          el.dataset.offset = '50';
          const itemCount = this.listTarget.querySelectorAll('[data-inbox-target="item"]').length;
          el.classList.toggle('hidden', itemCount < 50);
          const btn = el.querySelector('button');
          if (btn) btn.textContent = 'Charger 50 de plus';
        }
        // Ré-applique la recherche si besoin
        if (this.hasSearchInputTarget && this.searchInputTarget.value) {
          this._filterItems(this.searchInputTarget.value);
        }
        // Ré-sélectionne l'issue courante si elle est encore dans la liste
        if (this._currentIssueId) {
          const current = this.listTarget.querySelector(`[data-inbox-id-param="${this._currentIssueId}"]`);
          if (current) this.selectItem(current);
        }
      } catch (e) {
        console.error('Erreur rafraîchissement liste inbox', e);
      }
    }

    search(event) {
      this._filterItems(event.target.value);
    }

    _filterItems(query) {
      const q = query.toLowerCase().trim();
      this.itemTargets.forEach(item => {
        const text = item.dataset.searchText || item.textContent.toLowerCase();
        item.style.display = !q || text.includes(q) ? '' : 'none';
      });
    }

 });

})();
