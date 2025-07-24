import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);


const messages = {
  en: {
    
  },
  fr: {
    mySpace: {
      title: "Mon espace",
      taskTitle: "Mes tâches",
      notesTitle: "Mes notes"
    },
    todo: {
      columns: 'Colonnes',
      lists: 'Listes',
      closed: 'Terminées',
      addList: "Ajouter une liste",
      enterTitle: "Entrer un titre",
      save: "Enregistrer",
      title: "Titre",
      tags: "Tags",
      todo: "Todo",
      menu: "Paramètres",
      displayType: "Type d'affichage",
      settingsDisplay: "Paramètres d'affichage",
      settings: "Paramètres généraux",
      search: "Rechercher",
      displayColumns: "Kanban",
      displayList: "Liste",
      filters: "Filtres",
      synchronize: "Synchroniser avec le projet",
      filterList: "Rechercher"
    },
    task: {
      addNewTask: "Ajouter une nouvelle tâche",
      add: "Ajouter",
      cancel: "Annuler",
      addNew: "Nouvelle tâche",
      addBy: "Ajouté par",
      the: "le",
      updatedOn: "Mis à jour le"
    },
    note: {
      enterTitle: "Entrer un titre",
      title: "Titre",
      addNote: "Ajouter une liste de notes",
      save: "Enregistrer",
      addNoteForm: "Ajouter une nouvelle note",
      cancel: "Annuler",
      addNew: "Nouvelle",
      add: "Ajouter"
    },
    card: {
      close: "Fermer",
      advancedEdit: "Modifications avancées",
      description: "Description",
      noDescription: "Aucune description",
      checklist: "Checklist",
      created_at: "Créé le",
      updated_on: "Mis à jour le",
      due_date: "Echéance",
      no_due_date: "Aucune échéance",
      tags: "Tags",
      addTags: "Ajouter un tag",
      priority: "Priorité",
      done_ratio: "% réalisé"
    },
    dropdown: {
     
    }
  }
}

// Create VueI18n instance with options
export const i18n = new VueI18n({
  locale: 'fr', // set locale
  messages, // set locale messages
})
