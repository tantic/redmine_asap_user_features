class TodoController < ApplicationController
  self.main_menu = false

  before_action :find_project, except: [:configuration_required]
  before_action :find_todo_list, only: [:create_issue]

  def index
    @todo_lists = TodoList.where(project_id: @user_project.id, type_list: 'list')
                          .order(positionlist: :asc)

    # Si aucune liste → on synchronise, et on récupère la liste générée
    if @todo_lists.empty?
      @todo_lists = synchronize_todo_lists_with_project_versions
    end

    issues_closed_status = IssueStatus.where(is_closed: true).first
    priorities = IssuePriority.active

    # Affichage colonne → défaut
    display_todo = User.current.pref[:todo_display]
    if display_todo.blank?
      User.current.pref[:todo_display] = 'columns'
      User.current.pref.save!
      display_todo = 'columns'
    end

    # Garde uniquement les issues ouvertes
    @todo_lists = get_only_opened_issues_from_todo_lists(@todo_lists)
  end

  def complete_issue
    @issue = Issue.find(params[:id])
    closed_status = IssueStatus.where(is_closed: true).first

    @issue.update!(status: closed_status)

    respond_to do |format|
      format.js
      format.html { redirect_back fallback_location: root_path }
    end
  end

  def create_issue
    list = TodoList.find_by(id: params[:list_id])
    return render json: { error: 'Liste inconnue' }, status: :not_found unless list

    tracker = list.project.trackers.first
    return render json: { error: 'Aucun tracker actif pour ce projet' }, status: :unprocessable_entity unless tracker

    status = IssueStatus.where(is_closed: false).first
    return render json: { error: 'Aucun statut ouvert disponible' }, status: :unprocessable_entity unless status

    issue = Issue.new(
      subject:  params[:subject],
      project_id: list.project_id,
      tracker_id: tracker.id,
      status_id:  status.id,
      author_id:  User.current.id,
      fixed_version_id: list.version_project_id
    )

    if issue.save
      issue.todolist_issues.create!(todo_list_id: list.id)
      render json: { id: issue.id, subject: issue.subject }, status: :ok
    else
      Rails.logger.error "Erreur création issue : #{issue.errors.full_messages.inspect}"
      render json: { error: issue.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def move_issue
    issue = Issue.find(params[:id])
    new_list = TodoList.find(params[:list_id])

    link = TodolistIssue.find_or_initialize_by(issue: issue)
    link.update!(todo_list: new_list)

    if issue.fixed_version_id != new_list.version_project_id
      issue.update!(fixed_version_id: new_list.version_project_id)
    end

    reorder_issues(new_list, params[:ordered_ids])

    render json: { status: 'ok' }
  end

  def reorder_list
    list = TodoList.find(params[:id])
    reorder_issues(list, params[:ordered_ids])
    render json: { status: 'ok' }
  end

  def synchronize
    synchronize_todo_lists_with_project_versions
    respond_to do |format|
      format.html { redirect_to my_space_todo_index_path }
      format.js
    end
  end

  def configuration_required
  end

  private

  #######################################################################
  #   CRÉATION DU PROJET PERSONNEL (corrigée & atomique)
  #######################################################################
  def find_project
    config = Setting.plugin_redmine_asap_user_features

    parent_id  = config['settings_menu_todo_project_parent']
    tracker_id = config['settings_menu_todo_tracker']

    if parent_id.blank? || tracker_id.blank?
      redirect_to controller: 'todo', action: 'configuration_required'
      return
    end

    project_identifier = "user-#{User.current.id}"
    created = false

    @user_project = Project.find_or_create_by!(identifier: project_identifier) do |p|
      created = true
      p.name      = l(:label_list_personal_project) + User.current.to_s
      p.parent_id = parent_id.to_i
      p.is_public = false
    end

    if created
      tracker = Tracker.find(tracker_id.to_i)
      @user_project.trackers = [tracker]

      @user_project.disable_module!(:easy_gantt)
      @user_project.disable_module!(:easy_baselines)
      @user_project.disable_module!(:news)
      @user_project.disable_module!(:time_tracking)

      @user_project.add_default_member(User.current)

      default_version = @user_project.versions.create!(name: l(:label_list_default))
      @user_project.update(default_version: default_version)
    end

    @user_project
  end

  #######################################################################
  #   SYNCHRONISATION VERSIONS ↔ TODO LISTS (corrigée)
  #######################################################################
  def synchronize_todo_lists_with_project_versions
    existing_version_ids = @user_project.versions.pluck(:id)

    # Retire les listes liées à des versions supprimées
    TodoList.where(project_id: @user_project.id, type_list: 'list')
            .where.not(version_project_id: existing_version_ids)
            .destroy_all

    versions   = @user_project.versions.to_a
    todo_lists = TodoList.where(project_id: @user_project.id, type_list: 'list').to_a

    versions.each do |version|
      list = todo_lists.find { |l| l.version_project_id == version.id }

      if list.nil?
        TodoList.create!(
          name: version.name,
          project_id: @user_project.id,
          version_project_id: version.id,
          type_list: 'list'
        )
      elsif list.name != version.name
        list.update!(name: version.name)
      end
    end

    # Cas initial où aucune version n'existe → création
    if versions.empty? && todo_lists.empty?
      version = @user_project.versions.create!(name: 'Liste par défaut')
      TodoList.create!(
        name: version.name,
        project_id: @user_project.id,
        version_project_id: version.id,
        type_list: 'list'
      )
    end

    # IMPORTANT : retourner la liste finale !
    TodoList.where(project_id: @user_project.id, type_list: 'list')
            .order(positionlist: :asc)
  end

  #######################################################################
  #   UTILS
  #######################################################################

  def reorder_issues(list, ordered_ids)
    return unless ordered_ids.present?

    ordered_ids.each_with_index do |id, index|
      ti = TodolistIssue.find_by(issue_id: id, todo_list_id: list.id)
      ti.update!(position: index + 1) if ti
    end
  end

  def find_todo_list
    @todo_list = TodoList.where(project_id: @user_project.id).first
  end

  def get_only_opened_issues_from_todo_lists(todo_lists)
    Array(todo_lists).each do |todo_list|
      todo_list.issues = Array(todo_list.issues).reject(&:closed?)
    end
    todo_lists
  end
end
