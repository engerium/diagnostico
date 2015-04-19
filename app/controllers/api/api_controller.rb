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

	def whois
		query = Base64.decode64(params[:query])
		whois_response = Whois.whois(query)

		if (IPAddress.valid? query)
			split_query = query.split(".")
			reverse_query = "#{split_query[3]}.#{split_query[2]}.#{split_query[1]}.#{split_query[0]}"

			dig_packet = Net::DNS::Resolver.start("#{reverse_query}.origin.asn.cymru.com", Net::DNS::TXT)
			dig_answer = dig_packet.answer

			#render json: dig_answer
			#render json: whois_response
		else
			whois_parser = whois_response.parser

			render json: whois_parser.contacts
		end

	end
end
