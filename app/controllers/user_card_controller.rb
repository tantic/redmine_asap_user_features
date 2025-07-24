class UserCardController < ApplicationController
  def show
    @user = User.find_by_id(params[:user_id])
    render partial: 'user_card/show', locals: { user: @user}
  end
end
