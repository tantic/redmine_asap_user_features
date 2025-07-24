module RedmineAsapUserFeatures
  module IssuePatch
    def self.included(base)
      base.send(:include, InstanceMethods)
      base.class_eval do
        has_many :todolist_issues
        has_many :todo_lists, through: :todolist_issues
        # has_many :roadmap_column_issues
        # has_many :roadmap_columns, through: :roadmap_column_issues
      end
    end

    module InstanceMethods
    end
  end
end

Issue.include RedmineAsapUserFeatures::IssuePatch
