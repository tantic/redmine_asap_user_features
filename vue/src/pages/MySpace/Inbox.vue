<template>
<layout>
  <div id="inbox" class="flex">
    <issues-list v-if="issues.length" :issues=issues @elementDetailClick="elementDetailFunction"></issues-list>
    <issue-detail v-if="issue" :issue=issue></issue-detail>
  </div>
</layout>
</template>

<script>
  import IssuesList from '@/components/Inbox/IssuesList.vue'
  import IssueDetail from '@/components/Inbox/IssueDetail.vue'
  import axios from 'axios'; 
  import Layout from './Layout'

  export default {
    components: {
      IssuesList,
      IssueDetail,
      Layout,
    },
    props: {
      issues:null,
      issue_first:Object,
    },
    data () {
      return {
        issue:null,
      }
    },
    mounted: function(){
      this.issue = this.$props.issue_first
    },
    watch:{
      issue_first: function(){
        this.issue = this.$props.issue_first
      }
      
    },
    methods: {
      elementDetailFunction(id){
        axios.get("/my-space/inbox/issue/"+id)
        .then(response => {
            this.issue = response.data
        })
        .catch(err => {
            console.log(err)
        })
      }
    }
  }
</script>