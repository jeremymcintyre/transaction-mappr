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

  def get_earning_transactions_and_locations_on_date
    date = params[:date]
    transactions = get_transactions_on_date(date, "earning")
    locations = get_locations_on_date(date)
    render :json => {transactions: transactions, locations: locations}
  end

  private

    def get_transactions_on_date(date, type)
      transactions = {}
      date = parse_date(date)

      all_users.each do |user|
        user_transactions =
          user.transactions
              .where("created_at = ? AND transaction_type = ?",
                date, type)

        transactions[user.name] = user_transactions unless user_transactions.empty?
      end
      transactions
    end

    def get_locations_on_date(date)
      locations = {}
      date = parse_date(date)

      all_users.each do |user|
        user_locales = user.locations.where("created_at = ?", date)
        locations[user.name] = user_locales unless user_locales.empty?
      end
      locations
    end

    def parse_date(date)
      Time.parse(date).utc.beginning_of_day
    end

end
