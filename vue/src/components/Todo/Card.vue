<template>
    <div id="card">
        <header>
            <div class="brand">
                <div class="element" :class="[element == editedTodo ? 'editing' : 'view', 'status-'+element.status.id]">
                    <div class="element-subject" @click="editTodo(element, 'subject')">
                        <h2>{{ element.subject }}</h2>
                    </div>
                    <input
                        id="element-subject-input"
                        class="edit"
                        type="text"
                        v-model="element.subject"
                        v-todo-focus="element == editedTodo"
                        @blur="doneEdit(element, 'subject')"
                        @keyup.enter="doneEdit(element, 'subject')"
                        @keyup.esc="cancelEdit(element, 'subject')"
                        />
                </div>

            </div>
            <div class="actions">
                <a class="btn" :href="'/issues/'+element.id+'/edit'">Modification avancée</a>
                <a class="btn" @click="closeModal()" href="#">Fermer</a>
            </div>
        </header>
        <div class="content">
            <div class="left">

                <div class="element" :class="[element == editedTodoDescription ? 'editing' : 'view', 'status-'+element.status.id]">
                    <div class="label">Description</div>
                    <div v-if="element.description"   @click="editTodo(element, 'description')" v-html="element.description.replace(/(?:\r\n|\r|\n)/g, '<br />')" class="element-description"></div>
                    <div v-else class="element-description"  @click="editTodo(element, 'description')">
                        Aucune description
                    </div>
                    <textarea
                        id="element-description-input"
                        class="edit"
                        type="text"
                        v-model="element.description"
                        v-todo-focus="element == editedTodoDescription"
                        @blur="doneEdit(element, 'description')"
                        @keyup.esc="cancelEdit(element, 'description')"
                        />
                </div>
                <div class="element" v-if="element.checklists">
                    <div class="label">Checklist</div>
                    <template v-if="element.checklists.length > 0">
                        <draggable
                            v-model="element.checklists"
                            @start="drag=true"
                            @end="drag=false"
                            v-bind="dragOptions"
                            id="todo-list"
                            @change="checklistMoved(element.checklists, $event)">

                            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                <div v-for="checklist in element.checklists" :key="checklist.id" class="element-checklist">
                                    <div :class="[checklist.is_done ? 'line-through' : '']" class="element-checklist-label">
                                        <input class="toggle" type="checkbox" v-model="checklist.is_done" @change="changeStatus(checklist)"/>
                                        <label>{{checklist.subject}}</label>
                                        <div class="actions">
                                            <a href="#" @click="removeChecklist(checklist)"><i class="fa fa-trash"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </transition-group>
                        </draggable>
                    </template>
                    <input
                        id="element-checklist-input"
                        class="edit"
                        type="text"
                        placeholder="Ajouter une tâche"
                        v-model="newChecklist"
                        @keyup.enter="doneEditChecklist(element)"
                        />
                </div>
            </div>
            <div class="right">
                <ul class="metadata">
                    <li>{{element.tracker.name}} #{{element.id}}</li>
                    <li>Créée le : {{element.created_on| formatDate}}</li>
                    <li>Mis à jour le : {{element.updated_on| formatDate}}</li>
                </ul>
                <div class="element">
                    <div class="label">% réalisé</div>
                    <vue-slide-bar
                        v-model="sliderCustomize.val"
                        :processStyle="sliderCustomize.processStyle"
                        :lineHeight="sliderCustomize.lineHeight"
                        :tooltipStyles="sliderCustomize.tooltipStyles"
                        @dragEnd="doneEdit(element, 'done_ratio')"/>
                </div>
                <div class="element priorities">
                    <div class="label">Priorité</div>
                    <select v-model="element.priority_id" @change="doneEdit(element, 'priority')">
                        <option v-for="priority in $page.props.priorities" :value="priority.id" :key="priority.id">
                            {{priority.name}}
                        </option>
                    </select>
                </div>
                <div class="element" :class="[element == editedTodoDueDate ? 'editing' : 'view', 'status-'+element.status.id]">
                    <div class="label">Echéance</div>
                    <div class="element-due-date" v-if="element.due_date" @click="editTodo(element, 'dueDate')">{{element.due_date| formatDateSimple}}</div>
                    <div v-else class="element-due-date"  @click="editTodo(element, 'dueDate')">
                        Aucune date
                    </div>
                    <input
                        id="element-due-date-input"
                        class="edit"
                        type="date"
                        v-model="element.due_date"
                        v-todo-focus="element == editedTodoDueDate"
                        @blur="doneEdit(element, 'dueDate')"
                        @keyup.enter="doneEdit(element, 'dueDate')"
                        @keyup.esc="cancelEdit(element, 'dueDate')"
                        />
                </div>
                <div class="element tags" v-if="element.tags">
                    <div class="label">Tags</div>
                    <vue-tags-input
                        v-model="tag"
                        :tags="tags"
                        :autocomplete-items="autocompleteItems"
                        @tags-changed="update"
                        />
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import draggable from 'vuedraggable'
import VueTagsInput from '@johmun/vue-tags-input';
import VueSlideBar from 'vue-slide-bar'
import { mapGetters, mapState } from 'vuex'
import axios from 'axios';

export default {
    components: {
        VueTagsInput,
        draggable,
        VueSlideBar
    },
    props: {
        element: Object,
    },
    data () {
        return {
            editedTodo: null,
            editedTodoDescription: null,
            editedTodoDueDate: null,
            beforeEditCache: null,
            tag: '',
            tags: [],
            autocompleteItems: [],
            debounce: null,
            newChecklist: null,
            drag: false,
            sliderCustomize: {
                val: null,
                lineHeight: 10,
                processStyle: {
                backgroundColor: '#42b883'
                },
                tooltipStyles: {
                    backgroundColor: '#42b883',
                    borderColor: '#42b883'
                }
            }
        }
    },
    created: function(){
        console.log("this.sliderCustomize.val "+this.sliderCustomize.val)
        console.log("this.$props.element.done_ratio "+this.$props.element.done_ratio)
        this.sliderCustomize.val = this.$props.element.done_ratio
    },
    mounted: function () {
        let tags_array = []
        for(let i=0; i<this.$props.element.tags.length; i++){
            let tag = {}
            tag = { id: this.$props.element.tags[i].name, text: this.$props.element.tags[i].name }
            tags_array.push(tag)
        }
        this.tags = tags_array

    },
    watch: {
        'tag': 'initItems',
        element: {
            deep: true,
            handler(){
                let tags_array = []
                for(let i=0; i<this.$props.element.tags.length; i++){
                    let tag = {}
                    tag = { id: this.$props.element.tags[i].name, text: this.$props.element.tags[i].name }
                    tags_array.push(tag)
                }
                this.tags = tags_array
                this.sliderCustomize.val = this.$props.element.done_ratio
            }
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
        }
    },

    methods: {
        editTodo: function(todo, type) {
            switch(type){
                case "subject":
                    this.editedTodo = todo;
                    this.beforeEditCache = todo.subject;
                    break;
                case "description":
                    this.editedTodoDescription = todo;
                    this.beforeEditCache = todo.description;
                    break;
                case "dueDate":
                    this.editedTodoDueDate = todo;
                    this.beforeEditCache = todo.dueDate;
                    break;
            }
        },
        doneEdit: function(todo, type) {
            switch(type){
                case "subject":
                    this.editedTodo = null;
                    todo.subject = todo.subject.trim();
                    if(todo.subject != this.beforeEditCache){
                        this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                            preserveState: true,
                            preserveScroll: true,
                        })
                    }
                    break;
                case "description":
                    this.editedTodoDescription = null;
                    todo.description = todo.description.trim();
                    if(todo.description != this.beforeEditCacheDescription){
                        this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                            preserveState: true,
                            preserveScroll: true,
                        })
                    }
                    break;
                case "dueDate":
                    if (!this.editedTodoDueDate) {
                        return;
                    }
                    this.editedTodoDueDate = null;
                    this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                        preserveState: true,
                        preserveScroll: true,
                    })
                    break;
                case "priority":
                    this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                        preserveState: true,
                        preserveScroll: true,
                    })
                    break;
                case "done_ratio":
                    todo.done_ratio = this.sliderCustomize.val
                    this.$inertia.post('/my-space/todo/'+todo.id+'/update/', todo, {
                        preserveState: true,
                        preserveScroll: true,
                    })
                    break;
            }
            if (!this.editedTodo) {
                return;
            }

        },
        cancelEdit: function(todo, type) {
            switch(type){
                case "subject":
                    this.editedTodo = null;
                    todo.subject = this.beforeEditCache;
                    break;
                case "description":
                    this.editedTodoDescription = null;
                    todo.description = this.beforeEditCacheDescription;
                    break;
                case "dueDate":
                    this.editedTodoDueDate = null;
                    todo.due_date = this.beforeEditCacheDueDate;
                    break;
            }
        },
        closeModal(){
            this.$emit('todo-modale', "hide")
        },
        initItems() {
            if (this.tag.length < 2) return;

            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                axios.get('/auto_completes/redmine_tags?q='+this.tag).then(response => {
                    this.autocompleteItems = response.data.map(a => {
                        return { id: a.id, text: a.text };
                    });
                }).catch(() => console.warn('Oh. Something went wrong'));
            }, 600);
        },
        update(newTags) {
            this.autocompleteItems = [];
            this.tags = newTags;
            var data = new FormData();
            if(this.tags.length > 0){
                for(let i=0; i<this.tags.length; i++){
                    data.append('issue[tag_list][]',this.tags[i].text)
                }
            } else {
                data.append('issue[tag_list][]','')
            }
            this.$inertia.post('/my-space/todo/'+this.$props.element.id+'/update_tags/', data, {
                preserveState: true,
                preserveScroll: true,
            })
        },
        changeStatus: function(checklist){
            var data = new FormData();
            data.append('is_done',checklist.is_done)
            this.$inertia.put('/my-space/todo/checklists/'+checklist.id+'/done/', data, {
                preserveState: true,
                preserveScroll: true,
            })
        },
        removeChecklist(checklist){
             axios.delete('/my-space/todo/checklists/'+checklist.id+'/remove/')
                .then(response => {
                    this.$emit('refresh', response.data)
                })
                .catch(err => {
                    console.log(err)
                })
        },
        doneEditChecklist: function(element){
            var data = new FormData();
            data.append('checklist[subject]',this.newChecklist)
            data.append('checklist[issue_id]',element.id)
            axios.post('/my-space/todo/'+element.id+'/checklists/', data)
                .then(response => {
                    this.$emit('refresh', response.data)
                })
                .catch(err => {
                    console.log(err)
                })
            this.newChecklist = null;
        },
        checklistMoved: function(todoList, $event) {
            if($event.moved){
                const {oldIndex, newIndex} = $event.moved;
                const element = $event.moved.element
                const position = newIndex;
                this.$inertia.post('/my-space/todo/checklists/'+element.id+'/move/'+position, element, {
                    preserveState: true,
                    preserveScroll: true,
                })
               // this.$emit('refresh', this.$props.element)
            }
            else if ($event.added){
                const {oldIndex, newIndex} = $event.added
                const element = $event.added.element
                const position = newIndex + 1;
                console.log("$event.added")
                // this.$inertia.post('/my-space/todo/list/'+todoList.id+'/issue/'+element.id+'/move/'+position, element, {
                //     preserveState: true,
                //     preserveScroll: true,
                // })
            }
        },
    },
    directives: {
        "todo-focus": function(el, binding) {
            if (binding.value) {
                el.focus();
            }
        }
    }
}
</script>