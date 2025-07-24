class CreateTodolistIssues < ActiveRecord::Migration[5.2]
  def self.up
    create_table :todolist_issues do |t|
      t.belongs_to :todo_list
      t.belongs_to :issue
      t.column :position, :integer
    end
  end
  def self.down
    drop_table :todolist_issues
   end
end
