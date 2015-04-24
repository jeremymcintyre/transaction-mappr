module UserHelper

  def all_users
    User.all
  end

  def get_all_users_transactions_and_users_locations
    @users_locations = {}
    @users_transactions = {}

    all_users.each do |user|
      @users_locations[[user.id, user.name]] = user.locations
      @users_transactions[[user.id, user.name]] = user.transactions
    end
  end

  def get_transactions_on_date(date, filter)
    transactions = {}
    date = parse_date(date)
    query = "created_at = ?"

    if filter == "both"
      all_users.each do |user|
        user_transactions = user.transactions.where(query, date)
        transactions[[user.id, user.name]] = user_transactions unless user_transactions.empty?
      end
    else
      query += " AND transaction_type = ?"
      all_users.each do |user|
        user_transactions = user.transactions.where(query, date, filter)
        transactions[[user.id, user.name]] = user_transactions unless user_transactions.empty?
      end
    end
    transactions
  end

  def get_locations_on_date(date)
    locations = {}
    date = parse_date(date)

    all_users.each do |user|
      user_locales = user.locations.where("created_at = ?", date)
      locations[[user.id, user.name]] = user_locales unless user_locales.empty?
    end
    locations
  end

  def parse_date(date)
    Time.parse(date).utc.beginning_of_day
  end

end
