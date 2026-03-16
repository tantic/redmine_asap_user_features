class InboxController < ApplicationController
  helper :all
  before_action :find_issues_counts
  self.main_menu = false
  layout 'inbox'

  PER_PAGE = 50


  # INBOX
  def index
    @list_source = 'index'
    base = Issue.visible.open
                .assigned_to(User.current)
                .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
    @issues = base.limit(PER_PAGE)
    @has_more = base.count > PER_PAGE
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
        @list_source = 'index'
        base = Issue.visible.open
                    .assigned_to(User.current)
                    .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
        @issues = base.limit(PER_PAGE)
        @has_more = base.count > PER_PAGE
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
    # @project = @issue.project   <-- retirer cette ligne

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


  def list
    offset = params[:offset].to_i
    source = params[:source].presence || 'index'

    base = case source
           when 'overdue'
             Issue.visible.open
                  .assigned_to(User.current)
                  .where('due_date < ?', Date.today)
                  .order(Arel.sql("issues.due_date ASC"))
           when 'watched'
             Issue.visible.open
                  .joins(:watchers)
                  .where(watchers: { user_id: User.current.id })
                  .distinct
                  .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
           else
             Issue.visible.open
                  .assigned_to(User.current)
                  .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
           end

    if offset > 0
      issues = base.offset(offset).limit(PER_PAGE)
      has_more = base.count > offset + PER_PAGE
      html = render_to_string(partial: 'inbox/list_items', locals: { issues: issues.to_a }, formats: [:html])
      render json: { html: html, has_more: has_more }
    else
      render partial: 'inbox/list', locals: { issues: base.limit(PER_PAGE) }
    end
  end

  def overdue
    @list_source = 'overdue'
    base = Issue.visible.open
                .assigned_to(User.current)
                .where('due_date < ?', Date.today)
                .order(Arel.sql("issues.due_date ASC"))
    @issues = base.limit(PER_PAGE)
    @has_more = base.count > PER_PAGE
    @first_issue = @issues.first
    if @first_issue
      @journals = @first_issue.visible_journals_with_index
      @journals.reverse! if User.current.wants_comments_in_reverse_order?
      @relations = @first_issue.relations.select { |r| r.other_issue(@first_issue)&.visible? }
      @relation ||= IssueRelation.new
    end
    render :index
  end

  def watched
    @list_source = 'watched'
    base = Issue.visible.open
                .joins(:watchers)
                .where(watchers: { user_id: User.current.id })
                .distinct
                .order(Arel.sql("COALESCE(issues.updated_on, issues.created_on) DESC"))
    @issues_watched = base.limit(PER_PAGE)
    @has_more = base.count > PER_PAGE

    @first_issue = @issues_watched.first
    if @first_issue
      @journals = @first_issue.visible_journals_with_index
      @journals.reverse! if User.current.wants_comments_in_reverse_order?
      @relations = @first_issue.relations.select { |r| r.other_issue(@first_issue)&.visible? }
      @relation ||= IssueRelation.new
    end
  end


  private

  def find_issues_counts
    @issues_count = Issue.visible.open.where(assigned_to_id: User.current.id).count
    @issues_watched_count = Issue.visible.open.joins(:watchers)
                                 .where(watchers: { user_id: User.current.id }).count
    @issues_overdue_count = Issue.visible.open
                                 .where(assigned_to_id: User.current.id)
                                 .where('due_date < ?', Date.today).count
  end


  def issue_params
      params.require(:issue).permit(
          :id, :notes
      )
  end
end


