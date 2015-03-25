class CreateLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.references :user, index: true
      t.decimal :longitude, precision: 15, scale: 6, default: 0
      t.decimal :latitude, precision: 15, scale: 6, default: 0

      t.timestamps null: false
    end
    add_foreign_key :locations, :users
  end
end
