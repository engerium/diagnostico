class Api::ApiController < ApplicationController
	def getdomain
		domain = Base64.decode64(params[:ipaddr])
		response = HTTParty.get("http://api.statdns.com/x/#{domain}")

		render json: response.body
	end

	def getip
		domain = Base64.decode64(params[:domain])
		response = HTTParty.get("http://api.statdns.com/#{domain}/a")

		render json: response.body
	end

	def whois
		query = Base64.decode64(params[:query])
		whois_response = Whois.whois(query)

		if (IPAddress.valid? query)
			geoip_response = HTTParty.get("http://www.telize.com/geoip/#{query}")

			whois_json = {"whois": whois_response.to_s}.to_json
			concat_json = [geoip_response.body, whois_json].map{ |o| JSON[o] }.to_json

			render json: concat_json
		else
			whois_parser = whois_response.parser

			render json: whois_parser.contacts
		end

	end
end
