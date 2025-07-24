<template>
    <div id="menu-dropdown">
       <dropdown class="doc-menu" :visible="visible" :position="position" @clickout="visible = false">
            <span class="btn-column" @click="visible = true"><i class="fa fa-ellipsis-h"></i></span>
            <ul class="dialog" slot="dropdown">
                <li>
                    <a :href="'/versions/'+list.version_project_id+'/edit'"><i class="fa fa-pen"></i> <label>Modifier</label></a>
                </li>
                <li>
                    <inertia-link preserve-state preserve-scroll :href="'/my-space/todo/list/'+list.id"  method="delete"><i class="fa fa-trash"></i> <label>Supprimer</label></inertia-link>
                </li>
            </ul>
        </dropdown>
    </div>
</template>

<script>
import dropdown from 'vue-my-dropdown';

export default {
    
    components: {
        dropdown,
    },
    props: {
        list: Object,
        actions:null
    },
    data () {
        return {
            position: ["right", "bottom", "right", "top"],
            visible: false,
        }
    },
    methods: {

    },
}
</script>