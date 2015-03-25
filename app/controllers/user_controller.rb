class UserController < ApplicationController
  def all_users
    User.all
  end

  def all
    users_locations = {}
    users_transactions = {}
    all_users.each do |user|
      users_locations[user.name] = user.locations
      users_transactions[user.name] = user.transactions
    end
    render :json => {locations: users_locations, transactions: users_transactions}
  end
end
