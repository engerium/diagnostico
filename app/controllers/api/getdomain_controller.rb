class Api::GetdomainController < ApplicationController
	def index
		domain = Base64.decode64(params[:ipaddr])
		response = HTTParty.get('http://api.statdns.com/x/' + domain)
		render json: JSON.parse(response.body)
	end
end
