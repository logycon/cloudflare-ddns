import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const get = async (url) => {
    const headers = {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json'
    }
    const requestUrl = `https://api.cloudflare.com/client/v4${url}`
    return await axios.get(requestUrl, { headers });
};

const post = async (url, data) => {
    const headers = {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json'
    }
    const requestUrl = `https://api.cloudflare.com/client/v4${url}`
    return await axios.post(requestUrl, data, { headers });
};

const put = async (url, data) => {
    const headers = {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json'
    }
    const requestUrl = `https://api.cloudflare.com/client/v4${url}`
    return await axios.put(requestUrl, data, { headers });
};

const getPublicIp = async () => {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
}

const main = async () => {
    const publicIp = await getPublicIp();
    const myZoneName = process.env.CLOUDFLARE_ZONE_NAME;
    const zones = await get(`/zones`);
    const zone = zones.data.result.find((zone) => zone.name === myZoneName);
    const dnsRecords = await get(`/zones/${zone.id}/dns_records`);
    const aRecords = dnsRecords.data.result.filter((record) => record.type === 'A');
    const toUpdate = process.env.CLOUDFLARE_DOMAINS_TO_UPDATE.split(',');
    for(const domain of toUpdate) {
        const aRecord = aRecords.find((record) => record.name === `${domain}.${myZoneName}` || record.name === domain);
        let response;
        let action;
        try {
            if (aRecord == undefined) { // create
                action = 'created';
                const payload = {
                    type: 'A',
                    name: domain,
                    content: publicIp,
                    ttl: 1, // auto
                }
                response = await post(`/zones/${zone.id}/dns_records`, payload);
            } else { // update
                action = 'updated';
                const payload = {
                    type: 'A',
                    name: domain,
                    content: publicIp,
                    proxied: true,
                    ttl: 1, // auto
                }
                response = await put(`/zones/${zone.id}/dns_records/${aRecord.id}`, payload);
            }
            if (response.data.success) {
                console.log(`Successfully ${action} ${domain} to ${publicIp}`);
            } else {
                console.log(`Failed to ${action} ${domain} to ${publicIp}`);
                console.log(response.data.errors);
            }
        } catch (error) {
            console.log(error.response.data)
        }

    }
};    


main();