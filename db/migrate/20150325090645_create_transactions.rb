class CreateTransactions < ActiveRecord::Migration
  def change
    create_table :transactions do |t|
      t.references :user, index: true
      t.string :transaction_type
      t.decimal :amount, scale: 2

      t.timestamps null: false
    end
    add_foreign_key :transactions, :users
  end
end
