require_dependency "application_helper"
module RedmineAsapUserFeatures
  module ApplicationHelperPatch
    def self.included(base)
        base.class_eval do
            alias_method :link_to_user_without_patch, :link_to_user
            alias_method :link_to_user, :link_to_user_with_patch
        end
    end

    def link_to_user_with_patch(user, options = { })
        if user.is_a?(User)
            name = h(user.name(options[:format]))
            if user.active? || (User.current.admin? && user.logged?)
                user_card_url = "/user_card/" + user.id.to_s
                only_path = options[:only_path].nil? ? true : options[:only_path]
                link_to name, user_url(user, :only_path => only_path), :class => user.css_classes, :'data-controller' => "user-popover", :'data-action' => "mouseenter->user-popover#show mouseleave->user-popover#hide", :'data-user-popover-url-value' => user_card_url
            else
                name
            end
        else
            h(user.to_s)
        end
    end

  end

end
ApplicationHelper.include RedmineAsapUserFeatures::ApplicationHelperPatch

