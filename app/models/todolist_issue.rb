class TodolistIssue < ActiveRecord::Base
  default_scope { order :position }
  belongs_to :todo_list
  belongs_to :issue
  acts_as_list :scope => :todo_list
end
