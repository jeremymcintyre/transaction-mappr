class UserController < ApplicationController
  include UserHelper

  def all
    get_all_users_transactions_and_users_locations
    render :json => {locations: @users_locations, transactions: @users_transactions}
  end

  def get_transactions_and_locations_on_date
    date, filter = params[:date], params[:filter]
    transactions = get_transactions_on_date(date, filter)
    locations = get_locations_on_date(date)
    render :json => {transactions: transactions, locations: locations}
  end

end
