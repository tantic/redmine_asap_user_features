<template>
    <transition name="slide-fade">
      <div id="menu-panel" class="absolute bg-white shadow-md p-0 my-0 h-full right-0">
        <header class="px-4 py-3 bg-gray-50">
          <h4 class="p-0 m-0 flex">
            <span class="text-gray-500 uppercase">{{ $t("todo.menu") }}</span>
            <span class="ml-auto ">
              <a href="#" @click="onToggleClick()" class="text-gray-300"><i class="fas fa-times"></i></a>
            </span>
          </h4>
        </header>
        <div class="p-2 bg-white">

          <!-- <div class="my-3 px-3">
            <input v-model="search" type="text" class="w-full" :placeholder="$t('todo.search')">
          </div> -->

          <div class="mt-4 flex flex-col">
            <h3 class="uppercase text-xs text-gray-500 mb-3 px-3">{{ $t("todo.displayType") }}</h3>
            <a :class="{ 'bg-gray-200 text-gray-700': isActiveDisplay('columns') }" class="text-gray-800 flex items-center w-full my-0.5 hover-bg-gray-200 hover:text-gray-700 px-3 py-2 rounded-md" @click="changeDisplayCard('columns')" href="#"><i class="fas fa-columns mr-2"></i>&nbsp;{{ $t("todo.displayColumns") }}</a>
            <a :class="{ 'bg-gray-200 text-gray-700': isActiveDisplay('lists') }" class="text-gray-800 flex items-center w-full my-0.5 hover-bg-gray-200 hover:text-gray-700 px-3 py-2 rounded-md" @click="changeDisplayCard('lists')" href="#"><i class="fas fa-bars mr-2"></i>&nbsp;{{ $t("todo.displayList") }}</a>
          </div>

          <div class="mt-4 flex flex-col" v-if="tagSelected">
            <h3 class="uppercase text-xs text-gray-500  mb-3 px-3">{{ $t("todo.filters") }}</h3>
            <div class="">
              <h4 class="mb-2 px-3"><i class="fa fa-tag"></i> {{ $t("todo.tags") }}</h4>
              <div id="list-tags-cloud" class=" p-3 flex flex-wrap">
                <span v-for="(cpt,tag) in $page.props.tags" :key="tag" class="flex mb-2">
                  <a :class="{ active: isActiveTag(tag) }" class="mr-2 text-xs inline-flex items-center font-semibold leading-sm px-3 py-1 bg-pink-200 text-pink-700 rounded-full" href="#" @click="filterIssue(tag)" method="get">
                    <span class="mr-2">{{ tag }}</span>
                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-pink-600 rounded-full">{{ cpt }}</span>
                    <span v-if="isActiveTag(tag)" class="cross"><i class="fas fa-times ml-2"></i></span>
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 flex flex-col">
            <h3 class="uppercase text-xs text-gray-500  mb-3 px-3">{{ $t("todo.settings") }}</h3>
            <div class="">
              <a class="text-gray-800 flex items-center w-full my-1 hover:bg-gray-200 hover:text-gray-700 px-3 py-2 rounded-md" @click="synchronize()" href="#"><i class="fas fa-sync mr-2"></i>&nbsp;{{ $t("todo.synchronize") }}</a>
            </div>
          </div>
        </div>
      </div>
    </transition>
</template>


<script>
import { mapGetters } from 'vuex'
import axios from 'axios';

export default {
    components: {

    },
    props: {

    },
    data () {
        return {
            search: null,
            // activeItem: null,
        }
    },
    mounted: function () {

    },
    watch: {
        search(){
          console.log("recherche du terme "+this.search)
        }
    },
    computed: {
        ...mapGetters({
            menuPanelOpened: 'todo/isMenuPanelOpened',
            displayTasks: 'todo/getDisplayTasks',
            tagSelected: 'todo/getTagSelected',
        }),
    },
    methods: {
        onToggleClick () {
            this.$store.dispatch('todo/toggleMenuPanel')
        },
        filterIssue(tag){
            // Disable the filter
            if(this.tagSelected === tag){
                this.$store.dispatch('todo/selectTag', null)
            }
            else{
                // Add filter
                this.$store.dispatch('todo/selectTag', tag)
            }
        },
        isActiveTag: function (tag) {
            return this.tagSelected === tag
        },
        isActiveDisplay: function (type) {
            return this.displayTasks === type
        },
        changeDisplayCard: function(type){
          this.$store.dispatch('todo/setDisplayTasks', type)
        },
        synchronize: function(type){
          axios.get("/my-space/todo/synchronize")
            .then(response => {
                console.log("synchronization done")
                window.location.reload();
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
}
</script>