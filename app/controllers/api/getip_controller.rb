class Api::GetipController < ApplicationController
	def index
		domain = Base64.decode64(params[:domain])
		response = HTTParty.get('http://api.statdns.com/' + domain + "/a")
		render json: JSON.parse(response.body)
	end
end
