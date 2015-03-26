require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  describe 'GET #index' do
    context 'landing on page' do
      before do
        get :index
      end
      it "responds with ok status" do
        expect(response).to be_ok
      end

      it "responds with html" do
        expect(response.content_type).to eq('text/html')
      end

      it "renders application layout" do
        expect(response).to render_template(:application)
      end

      it "renders with index template" do
        expect(response).to render_template(:index)
      end

    end
  end
end