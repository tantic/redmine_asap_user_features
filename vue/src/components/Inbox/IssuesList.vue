<template>
    <div id="issues">
      <div class="entete">
        <input v-model="queryIssues" placeholder="Filtrer la liste">
      </div>
      <ul v-if="issues" :filter-key="queryIssues">
          <li v-for="issue in filteredData" v-bind:class="{ late: issue.late }" :key="issue.id">
            <a href="#" v-on:click="displayIssue(issue.id)" :class="{active:issue.id == selected}">
              <div class="author-avatar" v-html="issue.avatar"></div>
              <div class="issue-detail-1">
                <div class="issue-detail-line-1">
                  <span class="issue-project">{{ issue.project }} </span>
                  <span class="issue-updated-on">{{ issue.updated_on}}</span>
                </div>
                <div class="issue-detail-line-2">
                  {{ issue.tracker }} #{{ issue.id }} {{ issue.subject }}
                </div>
                <div class="issue-detail-line-3">
                  <span v-if="issue.start_date" class="issue-start-date">Début : {{ issue.start_date }}</span>
                  <span v-if="issue.due_date" class="issue-due-date">Echéance : {{ issue.due_date }}</span>
                </div>
              </div>
            </a>
          </li>
      </ul>
    </div>
</template>

<script>
export default {
  name: 'IssuesList',
  props: {
    issues: null,
    query:null,
  },
  data: function() {
    return {
      queryIssues: null,
      selected: undefined,
    }
  },
  created: function() {
    if (this.issues != null){
      this.displayIssue(this.issues[0].id)
    }
  },
  mounted: function(){
    LetterAvatar.transform();
  },
  updated: function(){
    LetterAvatar.transform();
  },
  methods: {  
    displayIssue: function(id){
      this.selected = id
      this.$emit('elementDetailClick', id)
    },
  },
  computed: {
    filteredData: function () {
      var filterKey = this.queryIssues && this.queryIssues.toLowerCase()
      var donnees = this.issues
      if (filterKey) {
        donnees = donnees.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          })
        })
      }
      return donnees
    }
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
}

</script>
