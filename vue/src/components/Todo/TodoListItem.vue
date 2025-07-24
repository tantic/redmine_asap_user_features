<template>
    <div id="todo-list-component" class="overflow-auto">
        <localDraggable
        v-model="todos"
        @start="drag=true"
        @end="drag=false"
        v-bind="dragOptions"
        :group="{ name: 'elements' }"
        ghost-class="ghost"
        id="todo-list"
        :empty-insert-threshold="100"
        @change="todoMoved(list, $event)">

        <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <div :id="element.id" class="" v-for="element in todos" :key="element.id">
                <div class="element-todo bg-white flex shadow items-center rounded mt-2 p-0 cursor-move" v-if="elementContainsTag(element)"  :class="[element == editedTodo ? 'editing' : 'view', 'status-'+element.status.id, 'priority-'+element.priority_id]">
                    <div class="w-8 pl-3 mr-2 pt-0.5">
                        <input type="checkbox" class="mt-0" v-model="element.status.id" v-bind:true-value="closed_status.id" false-value="1" @change="changeStatus(element)"/>
                    </div>
                    <div class="flex flex-col w-full py-3 px-2"  @click="displayElementDetail(element)">
                        <label class="cursor-pointer"  >{{ element.subject }} </label>
                        <div v-if="element.done_ratio > 0" class="mt-2 relative pt-1 w-full">
                            <div class="overflow-hidden z-0 h-2 mb-2 text-xs flex rounded bg-gray-100 w-full">
                                <div class="shadow-none flex flex-col text-center text-xxs whitespace-nowrap text-white justify-center bg-green-500" role="progressbar" :style="{width: element.done_ratio + '%'}"  aria-valuemin="0" aria-valuemax="100">{{element.done_ratio}}%</div>
                            </div>
                        </div>
                        <div class="flex mt-2 mb-2" v-if="element.due_date || (element.checklists && element.checklists.length > 0)">
                            <div v-if="element.due_date" class="flex text-gray-500 text-xs items-center">
                                <i class="far fa-clock mr-1"></i> {{element.due_date| formatDateSimple}}
                            </div>
                            <div v-if="element.checklists && element.checklists.length > 0" class="ml-auto text-gray-500 text-xs flex items-center">
                                <i class="fas fa-tasks mr-1"></i> {{element.checklists.length}}
                            </div>
                        </div>
                        <div v-if="element.tags && element.tags.length > 0" class="mt-1 flex flex-wrap">
                            <div v-for="(tag, index) in element.tags" :key="index" class="mb-1">
                                <a href="#" class="mr-2 text-xs inline-flex items-center font-semibold leading-sm px-3 py-1 bg-pink-200 text-pink-700 rounded-full">{{tag.name}}</a>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </transition-group>

      </localDraggable>
      <div id="element-form" v-if="addTaskForm">
            <div class="element-form-form">
                <textarea
                    resize="none"
                    height="60px"
                    class="w-full text-xs mt-4"
                    :placeholder="$t('task.addNewTask')"
                    v-focus
                    v-model="newTodoText"
                    @keydown.enter="addTodo"
                ></textarea>
            </div>
            <div class="flex justify-end mb-6 mt-2">
                <a href="#" class="btn mr-2" @click="addTodo">{{ $t("task.add") }}</a>
                <a href="#" class="btn" id="element-form-actions-anchor" @click="toggleForm()">{{ $t("task.cancel") }}</a>
            </div>
        </div>
      <div id="todo-component-footer" class="my-4 cursor-pointer w-full" v-if="!addTaskForm">
          <a class="p-2 hover-bg-gray-200 w-full rounded flex items-center text-gray-700" @click="toggleForm()"><i class="fa fa-plus mr-2"></i> {{ $t("task.addNew") }}</a>
      </div>
    </div>
</template>

<script>
import localDraggable from 'vuedraggable';
import axios from 'axios';
import { mapGetters } from 'vuex'

export default {
    components: {
        localDraggable,
        //InputText,
    },
    props: {
        list: Object,
        issues: Array,
        list_draggable: Boolean,
        issues_closed_status: Object,
    },
    data () {
        return {
            todos: this.issues,
            closed_status: this.issues_closed_status,
            drag: false,
            editedTodo: null,
            beforeEditCache: null,
            addTaskForm: false,
            newTodoText: null,
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 200,
                group: "description",
                disabled: this.list_draggable,
                ghostClass: "ghost",
            };
        },
        ...mapGetters({
            tagSelected: 'todo/getTagSelected',
            searchTerm: 'todo/getSearchTerm',
        }),
        // filteredTodos: function () {
        //     var filterKey = this.searchTerm && this.searchTerm.toLowerCase()
        //     var datas = this.todos
        //     if (filterKey) {
        //         datas = datas.filter(function (row) {
        //             return Object.keys(row).some(function (key) {
        //                 return String(row[key]).toLowerCase().indexOf(filterKey) > -1
        //             })
        //         })
        //     }
        //     return datas
        // }
    },
    watch: {
      issues () {
        this.todos = this.issues
      },
    },
    methods: {
        todoMoved: function(todoList, $event) {
            if($event.moved){
                // move inside a column
                console.log("Deplacement dans une colonne")
                const {oldIndex, newIndex} = $event.moved;
                const element = $event.moved.element
                const position = newIndex+1;
                axios.post('/my-space/todo/list/'+this.list.id+'/issue/'+element.id+'/move/'+position, element)
                .then(response => {
                    this.todos = response.data
                    this.$emit('todosUpdate', this.list, this.todos)
                })
                .catch(err => {
                    console.log(err)
                })
            }
            if($event.removed){
                // remove issue from column source
                const element = $event.removed.element
                this.$emit('todosUpdateRemoveItem', this.list, element)
            }
            else if ($event.added){
                // add issue in column target
                const {oldIndex, newIndex} = $event.added
                const element = $event.added.element
                const position = newIndex + 1;
                axios.post('/my-space/todo/list/'+todoList.id+'/issue/'+element.id+'/move/'+position, element)
                .then(response => {
                    this.todos = response.data
                    this.$emit('todosUpdate', todoList, this.todos)
                })
                .catch(err => {
                    console.log(err)
                })
            }
        },

        removeTodo: function(todo) {
            this.todos.splice(this.todos.indexOf(todo), 1);
            this.$inertia.delete('/my-space/todo/'+todo.id, {
                preserveState: true,
                preserveScroll: true,
            })
        },
        editTodo: function(todo) {
            this.beforeEditCache = todo.subject;
            this.editedTodo = todo;
        },
        doneEdit: function(todo) {
            if (!this.editedTodo) {
                return;
            }
            this.editedTodo = null;
            todo.subject = todo.subject.trim();
            this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                preserveState: true,
                preserveScroll: true,
            })
            if (!todo.subject) {
                this.removeTodo(todo);
            }
        },
        cancelEdit: function(todo) {
            this.editedTodo = null;
            todo.subject = this.beforeEditCache;
        },
        changeStatus: function(element){
            this.$inertia.post('/my-space/todo/'+element.id+'/update/', element, {
                preserveState: true,
                preserveScroll: true,
            })
            if(element.status.id == this.closed_status.id && this.showCompleted == true){
                document.getElementById(element.id).style.display = "none";
            }
        },
        displayElementDetail(element){
            this.$emit('elementDetailClick', element)
            // this.$store.dispatch('todo/showTaskDetail', element.id)
        },

        elementContainsTag(element){
            // if(this.$props.selected_tag != null){
            if(this.tagSelected != null){
                if(element.tags.length > 0){
                    let is_present = 0;
                    for(var i=0; i<element.tags.length; i++){
                        // if(element.tags[i].name == this.$props.selected_tag){
                        if(element.tags[i].name == this.tagSelected){
                            is_present += 1;
                        }
                    }
                    if(is_present > 0){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
            }
            else{
                return true
            }
        },
        toggleForm(){
            this.addTaskForm = !this.addTaskForm
        },
        addTodo () {
            const trimmedText = this.newTodoText.trim()
            if (trimmedText) {
                let issue = new FormData()
                issue.append('issue[subject]',trimmedText || '')
                issue.append('issue[fixed_version_id]',this.list.version_project_id)
                issue.append('issue[list_id]',this.list.id)
                axios.post('/my-space/todo/create', issue)
                .then(response => {
                    let issue = response.data
                    this.list.issues.push(issue)
                })
                .catch(err => {
                    console.log(err)
                })
                this.newTodoText = ''
            }
        },
    },
    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
        "todo-focus": function(el, binding) {
            if (binding.value) {
                el.focus();
            }
        },
        focus: {
            // définition de la directive
            inserted: function (el) {
                el.focus()
            }
        },
    }
}
</script>