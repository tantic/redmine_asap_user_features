class InboxController < ApplicationController
  self.main_menu = false
  before_action :find_issues_counts
  helper :all
  layout 'inbox'


  # INBOX
  def index
    @issues = Issue.visible.open
              .assigned_to(User.current)
              .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
    @first_issue = @issues.first
    if @first_issue
      @journals = @first_issue.visible_journals_with_index
      @journals.reverse! if User.current.wants_comments_in_reverse_order?
      @relations = @first_issue.relations.select {|r| r.other_issue(@first_issue)&.visible?}
      @relation ||= IssueRelation.new
    end
  end

  def show
    @issue = Issue.find(params[:id])
    @journals = @issue.visible_journals_with_index
    @journals.reverse! if User.current.wants_comments_in_reverse_order?
    @relations = @issue.relations.select {|r| r.other_issue(@issue)&.visible?}
    @relation ||= IssueRelation.new
    respond_to do |format|
      format.html do
        # Appel normal (visite directe) → affiche toute la vue avec les 3 colonnes
        @issues = Issue.visible.open
                  .assigned_to(User.current)
                  .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
        @first_issue = @issue

        render :index
      end

      format.js do
        # Appel AJAX → ne rend que le détail
        render partial: "inbox/detail", locals: { issue: @issue, journals: @journals }
      end

      # fallback (au cas où)
      format.any { head :not_acceptable }
    end
  end


  def add_note
    @issue = Issue.find(params[:id])
    @project = @issue.project

    unless @issue.notes_addable?
      render plain: "Not allowed", status: :forbidden
      return
    end

    journal = @issue.init_journal(User.current)
    journal.notes = params[:notes]
    journal.private_notes = params[:private_notes] == "1"

    if @issue.save
      flash[:notice] = l(:notice_successful_update)
    else
      flash[:error] = l(:error_can_not_save_issue)
    end

    redirect_to my_space_inbox_path(id: @issue.id, anchor: "issue-#{@issue.id}")
  end


  def watched
    @issues_watched = Issue.visible.open
                      .joins(:watchers)
                      .where(watchers: { user_id: User.current.id })
                      .distinct
                      .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))

    @first_issue = @issues_watched.first

  end


  private

  def find_issues_counts
    @issues_count = Issue.visible.open.where(assigned_to_id: User.current.id).count
    @issues_watched_count = Issue.visible.open.joins(:watchers)
                                 .where(watchers: { user_id: User.current.id }).count
  end


  def issue_params
      params.require(:issue).permit(
          :id, :notes
      )
  end
end


