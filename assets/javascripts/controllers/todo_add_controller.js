(async function () {
  // Wait for Stimulus application to be available
  while (typeof Stimulus === 'undefined') {
      await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Import Controller from Stimulus module
  const { Controller } = await import('@hotwired/stimulus');

  Stimulus.register("todo-add", class extends Controller {
    static targets = [ "form", "input", "plusButton"]

    static values = {
      listId: Number
    }


    connect(){
      console.log("Dans la todo add")
    }

    showForm() {
      console.log("showForm")
      this.formTarget.classList.remove('hidden!');
      this.inputTarget.focus();
      this.plusButtonTarget.classList.add('hidden');
    }

    cancelForm() {
        this.formTarget.classList.add('hidden!');
        this.plusButtonTarget.classList.remove('hidden');
        this.inputTarget.value = '';
    }

    addIssue(event) {
        event.preventDefault();

        const subject = this.inputTarget.value.trim();
        if (!subject) {
            this.inputTarget.focus();
            return;
        }
        console.log("on ajoute l'issue")
        fetch(`/my-space/todo/lists/${this.listIdValue}/issues`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ subject: subject })
        })
        .then(response => response.json())
        .then((data) => {
            if (data.id) {
                const container = this.element.closest('.flex').querySelector('#column-issues');
                container.insertAdjacentHTML('beforeend', `
                  <div class="bg-white mt-3 rounded flex shadow dark:bg-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 overflow-hidden"
                       style="border-left: 4px solid #60a5fa;"
                       data-todo-target="issue"
                       data-issue-id="${data.id}"
                       data-action="click->todo#showIssueDetail">
                    <div class="flex items-center justify-center px-4 py-4">
                      <input type="checkbox" class="" data-action="change->todo#completeIssue" data-issue-id="${data.id}">
                    </div>
                    <div class="font-normal text-xs w-full text-gray-900 dark:text-gray-100 nowrap flex flex-col justify-center">
                      <span class="pr-4 pt-3 pb-1 flex items-center text-gray-900 dark:text-gray-100 cursor-pointer">${data.subject}</span>
                      <div class="my-2 mr-4 mb-2 bg-gray-200 dark:bg-gray-600 rounded-full h-1" data-progress-bar>
                        <div class="h-1 bg-green-500 rounded-full transition-all duration-300" style="width: 0%;"></div>
                      </div>
                    </div>
                  </div>
                `);
            }
            this.cancelForm();
        });
    }


 });

})();
