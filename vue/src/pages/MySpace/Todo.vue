<template>
<layout>
  <div id="todo" class="pl-4 pr-4 pt-6 pb-6 overflow-y-auto ">
    <header class="flex container-todo">
      <div class="ml-auto flex">
        <a class="btn" href="#" @click="displayAddListForm()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg> 
            {{ $t("todo.addList") }}
        </a>
          <a class="btn" @click="onToggleClick()" href="#"><i class="fas fa-sliders-h mr-2"></i> {{ $t("todo.menu") }}</a>
      </div>
    </header>
    <TodoList :issues="list_tasks" :issues_closed_status="issues_closed_status" v-if="displayTasks == 'lists'"></TodoList>
    <TodoKanban  :issues="list_tasks" :issues_closed_status="issues_closed_status"  @elementDetailClick="elementDetailFunction" v-else></TodoKanban>

    <modal name="form-add-list" id="add-list-form" :focus-trap="true" @closed="onCloseModal">
      <h2>{{ $t("todo.addList") }}</h2>
      <form @submit.prevent="submit">
        <label for="name">{{ $t("todo.title") }}</label>
        <input id="name" type="text" v-model="form.name"  :placeholder="$t('todo.enterTitle')"/>
        <div>
          <button type="submit">{{ $t("todo.save") }}</button>
        </div>
      </form>
    </modal>

    <modal name="form-edit-list" id="add-list-form">
      <form @submit.prevent="submit">
        <label for="name">{{ $t("todo.title") }}</label>
        <input id="name" type="text" v-model="form.name"/>
        <button type="submit">{{ $t("todo.save") }}</button>
      </form>
    </modal>

    <menu-panel v-if="menuPanelOpened"></menu-panel>
    
    <!-- Display the detail of a task when clicked -->
    <modal name="todo-detail" id="todo-detail" :adaptive="true" width="60%" height="75%" :max-height="700" :scrollable="true"  slot="top-right">
      <card v-if="element" :element="element" @todo-modale="todoModale" @refresh="refreshElement"></card>
    </modal>

  </div>
  </layout>
</template>

<script>
  import Layout from './Layout'
  import TodoList from '@/components/Todo/TodoList.vue'
  import TodoKanban from '@/components/Todo/TodoKanban.vue'
  
  import Card from '@/components/Todo/Card.vue'
  import axios from 'axios'; 
  import { Inertia } from '@inertiajs/inertia'
  
  import MenuPanel from '@/components/Todo/MenuPanel.vue'
  import { mapGetters } from 'vuex'
  
  export default {
    components: {
      TodoKanban,
      TodoList,
      Card,
      Layout,
      MenuPanel
    },
    props: {
      todo_lists: null,
      issues_closed_status: null,
      display_todo: null,
    },
    data () {
      return {
        newTodoText: '',
        closed_status: this.issues_closed_status,
        showCompleted: true,
        addListForm:false,
        list_tasks:this.todo_lists,
        // display: {
        //   name: this.display_todo,
        // },
        display_todos: this.display_todo,
        form : {
          name: ''
        },
        drag: false,
        actions: null,
        todoDetail: null,
        element:null,
        // selectedTag: null,
        search: null,
        selected:null,
        
        tag: null,
      }
    },
    created: function(){
      this.$store.dispatch('todo/setDisplayTasksInit', this.display_todos);
      // this.displayTasks = this.$props.display_todo
    },
    computed: {
      ...mapGetters({
        menuPanelOpened: 'todo/isMenuPanelOpened',
        displayTasks: 'todo/getDisplayTasks',
        showTaskDetail: 'todo/getShowTaskDetail',
        showAddListModal: 'todo/getShowAddListModal',
      }),  
    },
    watch: {
      display_todos () {
        this.$store.dispatch('todo/setDisplayTasks', this.display_todos);
      },
      todo_lists () {
        this.list_tasks = this.todo_lists
      },
      showTaskDetail(){
        if(this.showTaskDetail == null){
          this.$modal.hide('todo-detail') 
        }else{
          // this.element = this.showTaskDetail
          this.$modal.show('todo-detail') 
        }
      },
      showAddListModal(){
        if(this.showAddListModal == null || this.showAddListModal == false ){
          this.$modal.hide('form-add-list') 
        }else{
          // this.element = this.showTaskDetail
          this.$modal.show('form-add-list') 
        }
      }
    },
    methods: {
      onToggleClick () {
        this.$store.dispatch('todo/toggleMenuPanel')
      },
      onCloseModal () {
        this.$store.dispatch('todo/showAddListModal', false)
      },

      addTodo () {
        const trimmedText = this.newTodoText.trim()
        if (trimmedText) {
          let issue = new FormData()
          issue.append('issue[subject]',trimmedText || '')
          axios.post('/my-space/todo/create', issue)
          .then(response => {
            let issue = response.data
            this.list_tasks[0].issues.push(issue)
          })
          .catch(err => {
              console.log(err)
          })
          this.newTodoText = ''
        }
      },
      removeTodo (idToRemove) {
        this.todos = this.todos.filter(todo => {
          return todo.id !== idToRemove
        })
      },
      displayMenuFunction(){
        this.displayMenu = !this.displayMenu
      },
      displayClosedIssues: function(){
        let statusClass = ".status-" + this.closed_status.id
        let closedIssues = document.querySelectorAll(statusClass);
        this.showCompleted = ! this.showCompleted
        for (var i = 0; i < closedIssues.length; i++) {
            closedIssues[i].style.display = "flex";
        }
      },
      closeClosedIssues: function(){
        let statusClass = ".status-" + this.closed_status.id
        let closedIssues = document.querySelectorAll(statusClass);
        this.showCompleted = ! this.showCompleted
        for (var i = 0; i < closedIssues.length; i++) {
            closedIssues[i].style.display = "none";
        }
      },
      displayAddListForm: function(){
        this.$modal.show('form-add-list')
      },
      changeDisplay(display_todo){
        this.display.name = display_todo
        this.$inertia.post('/my-space/todo/display', this.display, {
          preserveState: true,
          preserveScroll: true,
        })
      },
      displayListForm: function(){
        this.$modal.show('form-edit-list', { foo: 'bar' })
      },
      displayTodoDetails: function(){
        this.$modal.show('todo-detail')
      },
     
      submit: function() {
        let data = new FormData()
        data.append('list[name]', this.form.name || '')
        axios.post('/my-space/todo/list/add/', data)
        .then(response => {
          let list = response.data
          list.issues = []
          // list.version_project_id = list.id
          this.list_tasks.push(list)
        })
        .catch(err => {
            console.log(err)
        })
        this.addListForm = false
        this.form.name = ''
        this.$modal.hide('form-add-list')
      },
      todoModale(e){
        this.$modal.hide('todo-detail') 
      },
      refreshElement(e){
        this.elementDetailFunction(e)
        // console.log("on rafraichit")
        Inertia.reload({ only: ['todo_lists'] })
      },
      
      elementDetailFunction(e){
        axios.get("/my-space/todo/column/card/"+e.id)
        .then(response => {
            this.element = response.data
        })
        .catch(err => {
            console.log(err)
        })

        this.$modal.show('todo-detail',{ draggable: true })
      },

      
    }
  }
</script>