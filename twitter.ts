const args = Deno.args.slice();
const apiKey = args[0];
const apiSecret = args[1];
const accessToken = args[2];
const accessTokenSecret = args[3];
const tweet = args[4];

const oauthHeader = [
  `oauth_consumer_key="${apiKey}"`,
  `oauth_token="${apiSecret}"`,
  `oauth_signature_method="HMAC-SHA1"`,
  `oauth_timestamp="${new Date().getTime().toString()}"`,
  `oauth_nonce="${new Date().getTime().toString()}"`,
  `oauth_version="1.0"`,
  `oauth_signature="PrrDjbjuG%2FS4lL1jM2rdLiL9VYY%3D"`
];

const res = await fetch("https://api.twitter.com/1.1/statuses/update.json?status=" + tweet, {
  method: 'POST', // or 'PUT'
  headers: {
    "Authorization": "OAuth " + oauthHeader.join(","),
  },
});

console.log(await res.json());
