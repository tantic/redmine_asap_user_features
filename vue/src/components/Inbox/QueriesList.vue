<template>
    <div id="query">
      <div class="entete">
          <h2><a href="#" v-on:click="getQueries()">Boîte de réception</a></h2>
      </div>
      <div class="actions">
        <a href="/issues/new" class="btn btn-default">Nouvelle demande</a>
      </div>
      <ul v-if="queries" class="submenu">
          <li v-for="query in queries" :key="query.id">
             <inertia-link :href="'/my-space/inbox?query='+query.id" preserve-state :class="{active:query.id == selected}" v-on:click="displayQuery(query.id)"><span class="query-name">{{ query.name }}</span> <span class="badge">{{ query.count }}</span></inertia-link> 
          </li>
      </ul>
    </div>
</template>

<script>
export default {
  name: 'QueriesList',
  props: {
    queries: null,
    query: null
  },
  data: function() {
    return {
     selected: undefined,
    }
  },
  created: function() {
    if (this.queries != null){
      this.displayQuery(this.queries[0].id)
    }
  },
  methods: {
    displayQuery: function(id){
      this.selected = id
    }
  }
}

</script>
