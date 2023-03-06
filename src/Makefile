.phony: all

build: 
	docker build -t cloudflare-ddns:latest .

run:
	export $(grep -v '^#' .env | xargs)
	docker run --rm --name cloudflare-ddns \
		-e CLOUDFLARE_EMAIL=${CLOUDFLARE_EMAIL} \
		-e CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY} \
		-e CLOUDFLARE_ZONE_NAME=${CLOUDFLARE_ZONE_NAME} \
		-e CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID} \
		-e CLOUDFLARE_DOMAINS_TO_UPDATE=${CLOUDFLARE_DOMAINS_TO_UPDATE} \
		cloudflare-ddns:latest 