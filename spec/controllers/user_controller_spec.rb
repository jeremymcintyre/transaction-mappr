require 'rails_helper'

RSpec.describe UserController, type: :controller do

  describe 'GET /all' do
    before(:each) do
      get :all
    end

    context 'returns appropriate JSON object' do
      it 'should return OK status' do
        expect(response).to be_ok
      end

      it 'should also return an object with transactions and locations' do
        expect(response.body).to include('transactions')
        expect(response.body).to include('locations')
      end
    end
  end

  describe 'GET /results' do

    context 'returns an appropriate JSON object with valid parameters' do
      it 'should return OK status with valid parameters' do
        get :get_transactions_and_locations_on_date, {date: '2015-1-23', mode: 'earning'}
        expect(response).to be_ok
      end

      it 'should return an object with transactions and locations' do
        get :get_transactions_and_locations_on_date, {date: '2015-3-12', mode: 'charge'}
        expect(response.body).to include('transactions')
        expect(response.body).to include('locations')
      end
    end

  end
end
