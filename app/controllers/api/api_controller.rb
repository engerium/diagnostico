class Api::ApiController < ApplicationController
	def getdomain
		domain = Base64.decode64(params[:ipaddr])
		response = HTTParty.get('http://api.statdns.com/x/' + domain)
		render json: JSON.parse(response.body)
	end

	def getip
		domain = Base64.decode64(params[:domain])
		response = HTTParty.get('http://api.statdns.com/' + domain + "/a")
		render json: JSON.parse(response.body)
	end
end
