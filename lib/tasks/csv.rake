require 'csv'

namespace 'csv' do

  desc "Import CSV User Data"
  task :import_users => :environment do
    csv_file_path = 'db/users.csv'

    CSV.foreach(csv_file_path, headers: true) do |row|
      User.create!({
        name: row[1]
        })
    end
  end

  desc "Import CSV Transaction Data"
  task :import_tdata => :environment do
    csv_file_path = 'db/transactions.csv'

    CSV.foreach(csv_file_path, headers: true) do |row|
      Transaction.create!({
        created_at: row[1],
        user_id: row[2],
        transaction_type: row[3],
        amount: row[4]
        })
    end
  end

  desc "Import CSV Location Data"
  task :import_locations => :environment do
    csv_file_path = 'db/locations.csv'

    CSV.foreach(csv_file_path, headers: true) do |row|
      Location.create!({
        created_at: row[1],
        user_id: row[2],
        longitude: row[3],
        latitude: row[4]
        })
    end
  end

end