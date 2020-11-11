import { hmac } from "https://denopkg.com/chiefbiiko/hmac/mod.ts";

console.log(Deno.args);

const args = Deno.args.slice();
const apiKey = args[0];
const apiSecret = args[1];
const accessToken = args[2];
const accessTokenSecret = args[3];
const tweet = args[4];
const timestamp = Math.floor(new Date().getTime() / 1000).toString();

let sigPart1 = `POST&${
  encodeURIComponent("https://api.twitter.com/1.1/statuses/update.json")
}&`;
let sigPart2 = [
  `oauth_consumer_key=${apiKey.trim()}`,
  `oauth_nonce=${timestamp}`,
  `oauth_signature_method=HMAC-SHA1`,
  `oauth_timestamp=${timestamp}`,
  `oauth_token=${accessToken.trim()}`,
  `oauth_version=1.0`,
  `${tweet}`,
];
const sigPart2Encoded = sigPart2.map((value: string) => {
  return encodeURIComponent(value).replace(/!/g, "%21");
});
sigPart2Encoded[sigPart2Encoded.length - 1] = encodeURIComponent("status=") +
  encodeURIComponent(sigPart2Encoded[sigPart2Encoded.length - 1]);

const key = `${apiSecret.trim()}&${accessTokenSecret.trim()}`;
const message = sigPart1 + sigPart2Encoded.join("%26");
const oAuthSignature = getOAuthSignature(key, message);

function getOAuthSignature(key: string, message: string): string | Uint8Array {
  return hmac("sha1", key, message, "utf8", "base64") + "%3D";
}

sigPart2.pop();
sigPart2.push("oauth_signature=" + oAuthSignature);

const oAuthHeader = sigPart2.join(",");

console.log(oAuthHeader);

const res = await fetch(
  "https://api.twitter.com/1.1/statuses/update.json?status=" + tweet,
  {
    method: "POST",
    headers: {
      "Authorization": "OAuth " + oAuthHeader,
    },
  },
);

console.log(await res.json());
