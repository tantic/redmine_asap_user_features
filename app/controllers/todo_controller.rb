class TodoController < ApplicationController
  self.main_menu = false

  before_action :find_project, :except => [:configuration_required]
  before_action :find_todo_list, :only => [:create]

  def index
    # # synchronize_todo_lists_with_project_versions
    @todo_lists = TodoList.where(:project_id => @user_project.id, :type_list => 'list').order(positionlist: :asc)
    if @todo_lists.empty?
      synchronize_todo_lists_with_project_versions
    end
    issues_closed_status = IssueStatus.where(:is_closed => true).first
    priorities = IssuePriority.active
    display_todo = User.current.pref[:todo_display]
    @todo_lists = get_only_opened_issues_from_todo_lists(@todo_lists)
    if !display_todo
      User.current.pref[:todo_display] = 'columns'
      User.current.pref.save!
      display_todo = 'columns'
    end
  end

  def complete_issue
    @issue = Issue.find(params[:id])
    closed_status = IssueStatus.where(is_closed: true).first
    @issue.status = closed_status
    @issue.save!

    respond_to do |format|
      format.js   # complete_issue.js.erb
      format.html { redirect_back fallback_location: root_path }
    end
  end

  def create_issue
    list = TodoList.find_by(id: params[:list_id])
    unless list
      render json: { error: 'Liste inconnue' }, status: :not_found and return
    end

    tracker = list.project.trackers.first
    unless tracker
      render json: { error: 'Aucun tracker actif pour ce projet' }, status: :unprocessable_entity and return
    end

    status = IssueStatus.where(is_closed: false).first
    unless status
      render json: { error: 'Aucun statut ouvert disponible' }, status: :unprocessable_entity and return
    end
    issue = Issue.new(
      subject: params[:subject],
      project_id: list.project_id,
      tracker_id: tracker.id,
      status_id: status.id,
      author_id: User.current.id,
      fixed_version_id: list.version_project_id,
    )
    if issue.save
      # list.issue_ids << issue.id
      issue.todolist_issues.create(:todo_list_id => list.id.to_i)
      render json: { id: issue.id, subject: issue.subject }, status: :ok
    else
      Rails.logger.error "Erreur création issue : #{issue.errors.full_messages.inspect}"
      render json: { error: issue.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def move_issue
    issue = Issue.find(params[:id])
    new_list = TodoList.find(params[:list_id])

    # Met à jour ou crée le lien dans TodolistIssue
    link = TodolistIssue.find_or_initialize_by(issue: issue)
    link.todo_list = new_list
    link.save!

    # Met à jour la version de l'issue si différente
    if issue.fixed_version_id != new_list.version_project_id
      issue.update!(fixed_version_id: new_list.version_project_id)
    end

    # Réordonnancement dans la nouvelle liste
    if params[:ordered_ids].present?
      params[:ordered_ids].each_with_index do |id, index|
        ti = TodolistIssue.find_by(issue_id: id, todo_list_id: new_list.id)
        ti.update!(position: index + 1) if ti
      end
    end

    render json: { status: 'ok' }
  end



  def reorder_list
    list = TodoList.find(params[:id])
    if params[:ordered_ids].present?
      params[:ordered_ids].each_with_index do |id, index|
        ti = TodolistIssue.find_by(issue_id: id, todo_list_id: list.id)
        ti.update!(position: index + 1) if ti
      end
    end

    render json: { status: 'ok' }
  end


  def synchronize
    synchronize_todo_lists_with_project_versions
    respond_to do |format|
      format.html { redirect_to my_space_todo_index_path }
      format.js
    end
  end


  private

  def find_project

    if Setting.plugin_redmine_asap_user_features['settings_menu_todo_tracker'].nil? || Setting.plugin_redmine_asap_user_features['settings_menu_todo_project_parent'].nil?
      redirect_to ({ :controller => 'todo', :action => 'configuration_required'})
    elsif Setting.plugin_redmine_asap_user_features['settings_menu_todo_tracker'].empty? || Setting.plugin_redmine_asap_user_features['settings_menu_todo_project_parent'].empty?
      redirect_to ({ :controller => 'todo', :action => 'configuration_required'})
    else
      project_id = 'user-' + User.current.id.to_s
      @user_project = Project.find_by_identifier(project_id)
      tracker_task = Tracker.where(:id => Setting.plugin_redmine_asap_user_features['settings_menu_todo_tracker'].to_i).sorted.to_a
      if !@user_project
        project_name = l(:label_list_personal_project) + User.current.to_s

        @user_project = Project.new(:name => project_name, :identifier => project_id, :parent_id => Setting.plugin_redmine_asap_user_features['settings_menu_todo_project_parent'].to_i, :is_public => false)
        @user_project.add_default_member(User.current)
        @user_project.disable_module!(:easy_gantt)
        @user_project.disable_module!(:easy_baselines)
        @user_project.disable_module!(:news)
        @user_project.disable_module!(:time_tracking)
        @user_project.trackers = tracker_task
        @user_project.save!
        default_version = Version.new(:project_id => @user_project.id, :name => l(:label_list_default))
        @user_project.default_version = default_version
        @user_project.save
        return @user_project
      else
        return @user_project
      end
    end
  end

  def synchronize_versions_if_needed
    @user_project ||= find_project
    synchronize_todo_lists_with_project_versions
  end


  def synchronize_todo_lists_with_project_versions
    # Supprimer les todo_lists dont la version n'existe plus
    existing_version_ids = @user_project.versions.pluck(:id)
    orphan_lists = TodoList.where(project_id: @user_project.id, type_list: 'list')
                          .where.not(version_project_id: existing_version_ids)

    orphan_lists.each do |list|
      Rails.logger.info "[TODO] Suppression de la todo_list orpheline #{list.name} (id=#{list.id})"
      list.destroy
    end
    versions = @user_project.versions.to_a
    todo_lists = TodoList.where(project_id: @user_project.id, type_list: 'list').to_a

    # Crée les todo_lists manquantes
    versions.each do |version|
      matching_list = todo_lists.find { |tl| tl.version_project_id == version.id }

      if matching_list.nil?
        TodoList.create!(
          name: version.name,
          project_id: @user_project.id,
          version_project_id: version.id,
          type_list: 'list'
        )
      else
        # Met à jour le nom si besoin
        if matching_list.name != version.name
          matching_list.update(name: version.name)
        end
      end
    end

    # Crée une version par défaut s'il n'y a aucune version ni liste
    if versions.empty? && todo_lists.empty?
      version = Version.create!(name: 'Liste par défaut', project_id: @user_project.id)
      TodoList.create!(
        name: version.name,
        project_id: @user_project.id,
        version_project_id: version.id,
        type_list: 'list'
      )
    end

    # Synchronise les issues sans version vers la première todo_list
    default_list = TodoList.where(project_id: @user_project.id).first
    default_version_id = default_list&.version_project_id

    if default_list && default_version_id
      Issue.where(project_id: @user_project.id, fixed_version_id: nil).each do |issue|
        # Associe la version
        issue.update(fixed_version_id: default_version_id)

        # Crée le lien avec la todo_list s'il n'existe pas
        TodolistIssue.find_or_create_by!(issue_id: issue.id, todo_list_id: default_list.id)
      end
    end
  end


  def find_todo_list
    @todo_list = TodoList.where(:project_id => @user_project.id.to_i).first
    if !@todo_list.nil?
      return @todo_list
    end
  end


  def get_only_opened_issues_from_todo_lists(todo_lists)
    todo_lists.each do |todo_list|
      issues = []
      todo_list.issues.each do |issue|
        if !issue.closed?
          issues.push(issue)
        end
      end
      todo_list.issues = issues
    end
    return todo_lists
  end

  def issue_params
    params.fetch(:issue, {}).permit(
      :subject, :fixed_version_id, :list_id
    )
  end

  def list_params
    params.fetch(:list, {}).permit(:name)
  end

end
