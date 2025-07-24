// State object
const state = {
  menu_panel_opened: false,
  tag_selected: null,
  search_term: '',
  display_tasks: null,
  show_task_detail: null,
  show_add_list_modal: null,
  note: null,
}

// Getter functions
const getters = {
  isMenuPanelOpened: state => {
    return state.menu_panel_opened
  },
  getTagSelected: state => {
    return state.tag_selected
  },
  getSearchTerm: state => {
    return state.search_term
  },
  getDisplayTasks: state => {
    return state.display_tasks
  },
  getShowTaskDetail: state => {
    return state.show_task_detail
  },
  getShowAddListModal: state => {
    return state.show_add_list_modal
  },
  getNote: state => {
    return state.note
  }
}

// Actions 
const actions = {
  toggleMenuPanel ({ commit, state }) {
    commit('TOGGLE_MENU_PANEL', state)
  },
  selectTag ({ commit, state }, tag) {
    commit('SELECT_TAG', tag)
  },
  search({ commit, state }, term) {
    commit('SEARCH_TERM', term)
  },
  setDisplayTasks({ commit }, type) {
    axios.post('/my-space/todo/display', {'name': type})
    .then(response => {
      commit('SET_DISPLAY_TASKS', type)
    })
    .catch(err => {
        console.log(err)
    })
  },
  setDisplayTasksInit({ commit }, type) {
    commit('SET_DISPLAY_TASKS', type)
  },
  hideTaskDetail({ commit }) {
    commit('HIDE_TASK_DETAIL')
  },
  showTaskDetail({ commit, state }, id) {
    axios.get("/my-space/todo/column/card/"+id)
    .then(response => {
      commit('SHOW_TASK_DETAIL', response.data)
    })
    .catch(err => {
        console.log(err)
    })
  },
  showAddListModal({ commit }, value) {
    commit('SHOW_ADD_LIST_MODAL', value)
  },
  updateElement({ commit, state }, {field, value}) {
    commit('UPDATE_ELEMENT', {field, value})
  },
  setNote({ commit }, value) {
    commit('SET_NOTE', value)
  }
}

// Mutations
const mutations = {
  TOGGLE_MENU_PANEL(state){
    state.menu_panel_opened = !state.menu_panel_opened
  },
  SELECT_TAG(state, tag){
    state.tag_selected = tag
  },
  SEARCH_TERM(state, term){
    state.search_term = term
  },
  SET_DISPLAY_TASKS(state, type){
    state.display_tasks = type
  },
  SET_NOTE(state, note){
    state.note = note
  },
  HIDE_TASK_DETAIL(state, type){
    state.show_task_detail = null
  },
  SHOW_TASK_DETAIL(state, task){
    state.show_task_detail = task
  },
  UPDATE_ELEMENT (state, {field, value}) {
    switch(field){
      case "subject":
        state.show_task_detail.subject = value
        break;
      case "description":
        state.show_task_detail.description = value
        break;
      case "dueDate":
        state.show_task_detail.due_date = value
        break;
      case "priority_id":
        state.show_task_detail.priority_id = value
        break;
      case "tags_list":
        state.show_task_detail.tags = value
        break;
      case "checklist":
        state.show_task_detail.checklists = value.checklists
        break;
      case "done_ratio":
          state.show_task_detail.done_ratio = value
          break;
    }
  },
  SHOW_ADD_LIST_MODAL(state, value){
    state.show_add_list_modal = value
  },
}

import axios from 'axios'; 
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}