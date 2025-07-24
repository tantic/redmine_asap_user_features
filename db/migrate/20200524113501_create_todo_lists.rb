class CreateTodoLists < ActiveRecord::Migration[5.2]
  def self.up
    create_table :todo_lists do |t|
      t.column :name, :string
      t.column :project_id, :integer
      t.column :version_project_id, :integer
      t.column :positionlist, :integer
      t.column :type_list, :string

      t.timestamps
    end
  end
  def self.down
    drop_table :todo_lists
   end
end
