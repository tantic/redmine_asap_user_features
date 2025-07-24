require 'redmine'

Redmine::Plugin.register :redmine_asap_user_features do
  name 'Redmine Asap User Features plugin'
  author 'DGAC/DSNA - Tantic'
  description 'Plugin which add user features like inbox, todo'
  version '1.1.0'
  url 'https://github.com/tantic/redmine_asap_user_features'
  author_url 'https://github.com/tantic'

  settings :default => {'empty' => true}, :partial => 'settings/asap_user_features_settings'

  # create the sidebar menu
  Redmine::MenuManager.map :sidebar_menu do |menu|
    menu.push :todo, {:controller => 'todo', :action => 'index'}, :caption => :label_menu_asap_todo, first: :true,
      :if => Proc.new {User.current.logged?}
    menu.push :inbox, {:controller => 'inbox', :action => 'index'}, :caption => :label_menu_asap_inbox, first: :true,
      :if => Proc.new {User.current.logged?}
  end


  menu :tools_menu,
        :label_menu_asap_inbox,
        { :controller => 'inbox', :action => 'index' },
        :caption => :label_menu_asap_inbox,
        plugin: 'redmine_asap_user_features',
        html: { class: 'icon' },
        icon: 'inbox'

  menu :tools_menu,
        :label_menu_asap_todo,
        { :controller => 'todo', :action => 'index' },
        :caption => :label_menu_asap_todo,
        plugin: 'redmine_asap_user_features',
        html: { class: 'icon' },
        icon: 'checklist'
end


lib_dir = File.join(File.dirname(__FILE__), 'lib', 'redmine_asap_user_features')

# Redmine patches
patch_path = File.join(lib_dir, '*_patch.rb')
Dir.glob(patch_path).each do |file|
  require file
end

require lib_dir
require File.join(lib_dir, 'hooks')
