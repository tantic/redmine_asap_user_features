require 'redmine'

module RedmineAsapUserFeatures
  module Hooks
    class Hooks < Redmine::Hook::ViewListener

      # def view_layouts_base_html_head(context)
      #   tags = []
      #   tags << javascript_include_tag("controllers/user-popover_controller", :plugin => "redmine_asap_user_features")
      #   tags << javascript_include_tag("controllers/inbox_controller", :plugin => "redmine_asap_user_features")
      #   tags << javascript_include_tag("controllers/todo_controller", :plugin => "redmine_asap_user_features")
      #   tags << javascript_include_tag("controllers/todo_add_controller", :plugin => "redmine_asap_user_features")
      #   tags << javascript_include_tag("vendor/sortable.min.js", :plugin => "redmine_asap_user_features")
      #   tags << javascript_include_tag("controllers/sortable_controller", :plugin => "redmine_asap_user_features")
      #   safe_join(tags)
      # end
      render_on :view_layouts_base_html_head, partial: 'redmine_asap_user_features/html_head'

      def view_layouts_base_content(context = {})

      end
    end
  end
end
