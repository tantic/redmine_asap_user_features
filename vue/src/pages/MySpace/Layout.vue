<template>
  <main :class="[ sidebarCollapse == true ? 'collapse':'open']">
    <section>
      <div id="sidebar-pannel-collapse">
        <a href="#" v-if="sidebarCollapse" @click="toggleSidebar">
          <i class="fa fa-chevron-right"></i>
        </a>
        <a href="#" v-else @click="toggleSidebar">
          <i class="fa fa-chevron-left"></i>
        </a>
      </div> 
    
      <div v-for="(menu,index) in $page.props.menu" :key="index" class="px-3 mb-0 mt-0">
        <h2 v-if="menu.type == 'category'" class="py-3 px-2 mt-4  mb-1 text-gray-500 uppercase font-light text-sm">{{ menu.name }}</h2>
        <a class="text-gray-700 flex items-center w-full my-1 hover:bg-gray-200 hover:text-gray-800 px-2 py-2 rounded-md text-sm font-medium" v-else :href="menu.url" :class="{ 'bg-gray-200 text-white rounded-md text-sm font-medium': menu.selected === true}">
          <span class="todo-list-name">{{ menu.name }}</span>
          <span class="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-gray-100 bg-gray-600 rounded-full">{{ menu.count }}</span>
        </a>
      </div>
      </section>

    <article>
      <slot :tag="tag"/>
    </article>
  </main>
</template>

<script>
  export default {
    components: {
    
    },
    data() {
      return { 
        sidebarCollapse: false,
        tag: null,
        selected:null,
        activeItem: null,
      }
    },
    methods:{
      toggleSidebar: function(){
        this.sidebarCollapse = !this.sidebarCollapse
      },
      filterIssue(tag, index){
        if(this.activeItem === tag){
          this.activeItem = null
          this.$emit('tag', null)
        }
        else{
          this.activeItem = tag
          this.$emit('tag', tag)
        }
        
      },
      isActive: function (tag) {
        return this.activeItem === tag
      },
      displayAddListForm: function(){
        this.$store.dispatch('todo/showAddListModal', true);
      },
    }
    
  }
</script>