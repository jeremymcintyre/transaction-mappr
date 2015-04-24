require 'csv'

csv_file_path = 'db/users.csv'

CSV.foreach(csv_file_path, headers: true) do |row|
  User.create!({
    name: row[1]
    })
end

csv_file_path = 'db/transactions.csv'

CSV.foreach(csv_file_path, headers: true) do |row|
  Transaction.create!({
    created_at: row[1],
    user_id: row[2],
    transaction_type: row[3],
    amount: row[4]
    })
end

csv_file_path = 'db/locations.csv'

CSV.foreach(csv_file_path, headers: true) do |row|
  Location.create!({
    created_at: row[1],
    user_id: row[2],
    longitude: row[3],
    latitude: row[4]
    })
end