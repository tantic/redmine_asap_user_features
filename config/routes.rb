# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

# User card
get 'user_card/:user_id', to: 'user_card#show'

# Local avatar and letter avatar
match 'my/avatar', :to => 'my#avatar', :via => [:get, :post]
match 'my/save_avatar/:id', :to => 'my#save_avatar', :via => [:get, :post]
match 'account/get_avatar/:id', :to => 'account#get_avatar', :constraints => {:id=>/\d+/}, :via => [:get, :post]
match 'users/save_avatar/:id', :to => 'users#save_avatar', :constraints => {:id=>/\d+/}, :via => [:get, :post]
match 'users/get_avatar/:id', :to => 'users#get_avatar', :constraints => {:id=>/\d+/}, :via => [:get, :post]

# Todo
patch 'my-space/todo/issue/:id/complete', to: 'todo#complete_issue', as: :todo_issue_complete
post 'my-space/todo/lists/:list_id/issues', to: 'todo#create_issue'


get 'my-space/todo', :to => 'todo#index'
patch '/my-space/todo/issue/:id/move', to: 'todo#move_issue'
patch '/my-space/todo/list/:id/reorder', to: 'todo#reorder_list'



get 'my-space/todo/configuration_required', :to => 'todo#configuration_required'
get 'my-space/todo/today', :to => 'todo#today'
post 'my-space/todo/create', :to => 'todo#create'
post 'my-space/todo/list/add', :to => 'todo#list_add'
post 'my-space/todo/display', :to => 'todo#change_display'
post 'my-space/todo/list/:list_id/issue/:issue_id/move/:position_id', :to => 'todo#move'
post 'my-space/todo/list/:id/move/:position_id', :to => 'todo#move_list'
post 'my-space/todo/:id/update', :to => 'todo#update'
post 'my-space/todo/:id/update_tags', :to => 'issue_tags#update'
put 'my-space/todo/checklists/:id/done/', :to => 'todo#checklist_done'
post 'my-space/todo/checklists/:id/move/:position', :to => 'todo#checklist_move'
delete 'my-space/todo/checklists/:id/remove/', :to => 'todo#checklist_remove'
post 'my-space/todo/:issue_id/checklists/', :to => 'todo#checklist_create'
delete 'my-space/todo/:id', :to => 'todo#destroy'
delete 'my-space/todo/list/:id', :to => 'todo#version_destroy'
get 'my-space/todo/column/card/:id', :to => 'todo#card'
get 'my-space/todo/synchronize', :to => 'todo#synchronize_todo'


# Inbox
# get '/my-space/inbox', :to => 'inbox#index'
# get '/my-space/inbox/favorite', :to => 'inbox#favorite'
# # get '/my-space/inbox/issue/:id', :to => 'inbox#issue'
# get '/my-space/inbox/:id', to: 'inbox#show', as: 'inbox_issue'
scope path: 'my-space', as: 'my_space' do
  resources :inbox, only: [:index, :show] do
    collection do
      get :watched
    end
    post 'add_note', on: :member
  end
end