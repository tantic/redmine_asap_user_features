<template>
    <div id="display-kanban" class="flex h-auto mt-3">
        <draggable 
            v-model="list_tasks"
            @start="drag=true" 
            @end="drag=false"
            v-bind="dragOptions"
            :group="{ name: 'column' }"
            @change="todoMoved($event)"
            id="kanban-list"
            class="h-auto overflow-hidden">

        <transition-group type="transition" :name="!drag ? 'flip-list' : null" class="flex w-full overflow-auto h-full">
          <div v-for="list in list_tasks" :key="list.id" class="column-todos flex flex-col flex-shrink-0 overflow-auto w-72 bg-gray-100 rounded-lg px-3 py-3 mr-4 ">
            <div class="flex items-center group">
              <h2 class="uppercase font-light text-sm py-O my-3 text-gray-500">{{list.name}}</h2>
              <MenuDropDown :list="list" v-if="list_tasks.length > 1" class="ml-auto"/>
            </div>
            <!-- <TodoListItem :issues="list.issues" :search="search" :selected_tag="selectedTag" :list="list" :list_draggable="false" :issues_closed_status="issues_closed_status"  @elementDetailClick="elementDetailFunction"  @todosUpdate="todosUpdateFunction" @todosUpdateRemoveItem="todosUpdateRemoveItemFunction"/> -->
            <TodoListItem :issues="list.issues" :list="list" :list_draggable="false" :issues_closed_status="issues_closed_status_data" @todosUpdate="todosUpdateFunction" @todosUpdateRemoveItem="todosUpdateRemoveItemFunction" @elementDetailClick="elementDetailFunction"/>
          </div>
          
        </transition-group>
      </draggable> 
      <!-- <div id="add-list" class="flex h-auto my-6 w-64 items-start justify-center bg-gray-100 rounded-lg px-3 py-6 ">
        <a class="btn" href="#" @click="displayAddListForm()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg> 
            {{ $t("todo.addList") }}
        </a>
      </div> -->
    </div>
</template>


<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable';
import axios from 'axios'; 
import TodoListItem from '@/components/Todo/TodoListItem.vue'
import MenuDropDown from '@/components/Todo/MenuDropDown.vue'

export default {
    components: {
        draggable,
        TodoListItem,
        MenuDropDown,
    },
    props: {
       issues: null,
       issues_closed_status: null,
    },
    data () {
        return {
            list_tasks: this.issues,
            drag: false,
            issues_closed_status_data: this.issues_closed_status,
        }
    },
    watch: {
      issues () {
        this.list_tasks = this.issues
      },
    },
    computed: {
        dragOptions: function () {
            return {
                animation: 200,
                group: "description",
                ghostClass: "ghost",
            };
        }
    },
    methods: {
        todoMoved: function($event) {
            if($event.moved){
                // move inside a column
                const {oldIndex, newIndex} = $event.moved;
                const element = $event.moved.element
                const position = newIndex+1;
                this.$inertia.post('/my-space/todo/list/'+element.id+'/move/'+position, element, {
                    preserveState: true,
                    preserveScroll: true,
                })
                // axios.post('/my-space/todo/list/'+element.id+'/move/'+position, element)
                // .then(response => {
                //     console.log("Column moved")
                // })
                // .catch(err => {
                //     console.log(err)
                // })
            }
        },
        
        todosUpdateFunction(column, issues){
            for(let i=0; i<this.list_tasks.length; i++){
                if(this.list_tasks[i].id === column.id){
                    this.list_tasks[i].issues = issues
                }  
            }
        },
        todosUpdateRemoveItemFunction(column, element){
            for(let i=0; i<this.list_tasks.length; i++){
                if(this.list_tasks[i].id === column.id){
                    this.list_tasks[i].issues = this.list_tasks[i].issues.filter(item => item !== element)
                    // axios.get("/my-space/todo/column/"+this.list_tasks[i].id)
                    // .then(response => {
                    //     this.list_tasks[i].list_tasks = response.data
                    // })
                    // .catch(err => {
                    //     console.log(err)
                    // })
                }  
            }
        },
        
        // displayAddListForm: function(){
        //     this.$store.dispatch('todo/showAddListModal', true);
        // },
        elementDetailFunction(e){
            this.$emit('elementDetailClick', e)
        },

    },
}
</script>