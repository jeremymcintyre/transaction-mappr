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
    query = build_query(filter)
    filter_arg = filter unless filter == "both"

    all_users.each do |user|
      user_transactions = user.transactions.where(query, date, *filter_arg)
      transactions[[user.id, user.name]] = user_transactions unless user_transactions.empty?
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

  def build_query(filter)
    query = "created_at = ?"
    filter == "both" ? query : query + " AND transaction_type = ?"
  end

  def parse_date(date)
    Time.parse(date).utc.beginning_of_day
  end

end
