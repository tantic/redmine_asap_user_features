<template>
    <div id="display-list" class="flex flex-col h-full flex-grow mt-3 overflow-auto mb-10 ">
      <draggable 
        v-model="list_tasks" 
        @start="drag=true" 
        @end="drag=false"
        v-bind="dragOptions"
        :group="{ name: 'column' }"
        @change="todoMoved($event)" 
        id="list" 
        class="overflow-auto"
        >

        <transition-group type="transition" :name="!drag ? 'flip-list' : null"  tag="div" class="list-draggable">
          <div v-for="list in list_tasks" :key="list.id" class="list-todos bg-gray-100 rounded-lg px-3 py-3">
            <div class="column-header">
              <h2>{{list.name}}</h2>
              <MenuDropDown :list="list" v-if="list_tasks.length > 1"/>
            </div>
            <!-- <TodoListItem :issues="list.issues" :selected_tag="selectedTag" :list="list" :list_draggable="false" :issues_closed_status="issues_closed_status"  @elementDetailClick="elementDetailFunction" @todosUpdate="todosUpdateFunction" @todosUpdateRemoveItem="todosUpdateRemoveItemFunction"/> -->
            <TodoListItem :issues="list.issues" :selected_tag="selectedTag" :list="list" :list_draggable="false" :issues_closed_status="issues_closed_status"  @todosUpdate="todosUpdateFunction" @todosUpdateRemoveItem="todosUpdateRemoveItemFunction"/>
          </div>
          <div class="add-list">
            <a class="btn" href="#" @click="displayAddListForm()"><i class="fa fa-plus"></i> {{ $t("todo.addList") }}</a>
          </div>
        </transition-group>
      </draggable>
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
        
    },
}
</script>