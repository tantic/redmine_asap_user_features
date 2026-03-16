require_dependency 'welcome_controller'

module RedmineAsapUserFeatures
  module WelcomeControllerPatch
    def index
      super
      return unless User.current.logged?

      user_todo_project = Project.find_by(identifier: "user-#{User.current.id}")
      @todo_open_count = user_todo_project \
        ? Issue.open.where(project_id: user_todo_project.id).count
        : 0
    rescue StandardError
      @todo_open_count = 0
    end
  end
end

WelcomeController.prepend RedmineAsapUserFeatures::WelcomeControllerPatch
