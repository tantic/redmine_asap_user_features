(() => {
  const application = Stimulus.Application.start()

  application.register("todo-add", class extends Stimulus.Controller {
    static get targets() {
      return [ "form", "input", "plusButton"]
    }

    static get values() {
      return {listId: Number}
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
                  <div class="bg-white mt-3 rounded flex shadow dark:bg-gray-700 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" data-issue-id="${data.id}">
                    <div class="flex items-center justify-center px-4 py-4">
                      <input type="checkbox" class="" data-action="change->todo#completeIssue" data-issue-id="${data.id}">
                    </div>
                    <div class="font-normal text-xs w-full text-gray-900 dark:text-gray-100 nowrap dark:text-white">
                      <a href="/issues/${data.id}" class="pr-4 py-4 flex items-center text-gray-900!">${data.subject}</a>
                    </div>
                  </div>
                `);
            }
            this.cancelForm();
        });
    }


  })
})()