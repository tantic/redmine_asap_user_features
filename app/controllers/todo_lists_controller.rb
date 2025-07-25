class TodoListsController < ApplicationController
  self.main_menu = false
  before_action :find_user_project, :except => [:destroy]

  def new
    @todo_list = TodoList.new
    render layout: false
  end

  def create
    version = Version.new(project_id: @user_project.id, name: list_params[:name])
    if version.save
      list = TodoList.new(
        name: version.name,
        project_id: @user_project.id,
        version_project_id: version.id,
        type_list: 'list'
      )
      if list.save
        redirect_to my_space_todo_path()
      else
        render json: { error: list.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: version.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
    @todo_list = TodoList.find_by_id(params[:id])
    render :layout => false
  end

  def update
    @todo_list = TodoList.find_by_id(params[:id])
    @version = Version.find_by_id(@todo_list.version_project_id)
    if @todo_list.update!(name: list_params[:name])
      @version.update!(name: list_params[:name])
      redirect_to my_space_todo_path()
    else
      redirect_to my_space_todo_path()
    end
  end

  def destroy
    @todo_list = TodoList.find_by_id(params[:id])
    return redirect_to my_space_todo_path, alert: 'Liste introuvable' unless @todo_list

    @version = Version.find_by_id(@todo_list.version_project_id)
    return redirect_to my_space_todo_path, alert: 'Version associée introuvable' unless @version

    fallback_version = find_fallback_version(@version)
    return redirect_to my_space_todo_path, alert: 'Aucune version de repli disponible' unless fallback_version

    fallback_list = TodoList.find_by(version_project_id: fallback_version.id)
    unless fallback_list
      # Si aucune todo_list pour la version fallback, on peut en créer une (optionnel)
      fallback_list = TodoList.create!(
        name: fallback_version.name,
        project_id: fallback_version.project_id,
        version_project_id: fallback_version.id,
        type_list: 'list'
      )
    end

    # Déplacer les issues dans la bonne version ET bonne todo_list
    @version.fixed_issues.each do |issue|
      issue.update!(fixed_version: fallback_version)

      # Trouver ou créer la liaison avec la fallback todo_list
      todo_link = TodolistIssue.find_or_initialize_by(issue_id: issue.id)
      todo_link.todo_list_id = fallback_list.id
      todo_link.save!
    end

    @version.destroy
    @todo_list.destroy

    redirect_to my_space_todo_path
  end



  private

  def find_user_project
    @user_project = Project.find(params[:project_id] || params[:id])
  end

  def list_params
    params.require(:todo_list).permit(:name)
  end

  def find_fallback_version(version)
    # 1. Tenter de trouver la version par défaut du projet utilisateur
    user_project = Project.find_by_id(version.project.id)
    return user_project.default_version if user_project&.default_version && user_project.default_version != version

    # 2. Sinon, prendre une autre version du même projet
    version.project.versions.where.not(id: version.id).first
  end

end