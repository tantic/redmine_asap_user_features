class TodoList < ActiveRecord::Base
    belongs_to :project
    acts_as_list :column => 'positionlist', :scope => [:project_id]
    has_many :todolist_issues
    has_many :issues, through: :todolist_issues
end
