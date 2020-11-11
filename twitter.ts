import { hmac } from "https://denopkg.com/chiefbiiko/hmac@v1.0.2/mod.ts";

const args = Deno.args.slice();
const apiKey = args[0];
const apiSecret = args[1];
const accessToken = args[2];
const accessTokenSecret = args[3];
const tweetMessage = args[4];
const timestamp = Math.floor(new Date().getTime() / 1000).toString();
const params = [
  `oauth_consumer_key=${apiKey.trim()}`,
  `oauth_nonce=${timestamp}`,
  `oauth_signature_method=HMAC-SHA1`,
  `oauth_timestamp=${timestamp}`,
  `oauth_token=${accessToken.trim()}`,
  `oauth_version=1.0`,
  `${tweetMessage}`,
];

const s1 = getSignaturePart1();
const s2 = getSignaturePart2(params);
console.log(s2);
const s3 = getSignaturePart3(apiSecret, accessTokenSecret);
const oAuthSignature = getOAuthSignature(s3, s1 + s2);

await tweet(oAuthSignature, params, tweetMessage);

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function getOAuthSignature(key: string, message: string): string {
  return hmac("sha1", key, message, "utf8", "base64") + "%3D";
}

function getSignaturePart1(): string {
  return `POST&${
    encodeURIComponent("https://api.twitter.com/1.1/statuses/update.json")
  }&`;
}

function getSignaturePart2(params: string[]): string {
  const encoded = params.map((value: string) => {
    return encodeURIComponent(value)
      .replace(/!/g, "%21");
  });

  encoded[encoded.length - 1] = encodeURIComponent("status=") +
    encodeURIComponent(encoded[encoded.length - 1]);

  return encoded.join("%26");
}

function getSignaturePart3(
  apiSecret: string,
  accessTokenSecret: string,
): string {
  return `${encodeURIComponent(apiSecret.trim())}&${
    encodeURIComponent(accessTokenSecret.trim())
  }`;
}

async function tweet(
  oAuthSignature: string,
  params: string[],
  tweetMessage: string,
) {
  params.pop();
  params.push("oauth_signature=" + oAuthSignature);

  const authorizationHeader = "OAuth " + params.join(",");

  const res = await fetch(
    "https://api.twitter.com/1.1/statuses/update.json?status=" + encodeURIComponent(tweetMessage).replace(/!/g, "%21"),
    {
      method: "POST",
      headers: {
        "Authorization": authorizationHeader,
      },
    },
  );

  console.log(res);
}
