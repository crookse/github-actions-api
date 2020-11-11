import { hmac } from "https://denopkg.com/chiefbiiko/hmac@v1.0.2/mod.ts";

const args = Deno.args.slice();
const apiKey = args[0];
const apiSecret = args[1];
const accessToken = args[2];
const accessTokenSecret = args[3];
const repo = args[4];
const timestamp = Math.floor(new Date().getTime() / 1000).toString();
const params = [
  `oauth_consumer_key=${apiKey.trim()}`,
  `oauth_nonce=${timestamp}`,
  `oauth_signature_method=HMAC-SHA1`,
  `oauth_timestamp=${timestamp}`,
  `oauth_token=${accessToken.trim()}`,
  `oauth_version=1.0`,
  `${buildTweet(repo)}`,
];

await postToTwitter(
  getOAuthSignature(apiSecret, accessTokenSecret, params),
  params,
  buildTweet(repo)
);

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function buildTweet(repo: string): string {
  let tweet = "New {{ title }} version released! https://github.com/drashland/{{ repo }}/releases/latest";

  switch (repo) {
    case "dawn":
      tweet = replaceTweetFields(tweet, "Dawn", repo);
      break;
    case "dmm":
      tweet = replaceTweetFields(tweet, "dmm", repo);
      break;
    case "deno-drash":
      tweet = replaceTweetFields(tweet, "Drash", repo);
      break;
    case "rhum":
      tweet = replaceTweetFields(tweet, "Rhum", repo);
      break;
    case "wocket":
      tweet = replaceTweetFields(tweet, "Wocket", repo);
      break;
    default:
      throw new Error("Unknown module specified.");
  }

  return tweet;
}

function getOAuthSignature(
  apiSecret: string,
  accessTokenSecret: string,
  params: string[],
): string {
  const messagePart1 = getSignatureMessagePart1();
  const messagePart2 = getSignatureMessagePart2(params);
  const key = getSigningKey(apiSecret, accessTokenSecret);

  return hmac(
    "sha1",
    key,
    (messagePart1 + messagePart2),
    "utf8",
    "base64"
  ) + "%3D";
}

function getSignatureMessagePart1(): string {
  return `POST&${
    encodeURIComponent("https://api.twitter.com/1.1/statuses/update.json")
  }&`;
}

function getSignatureMessagePart2(params: string[]): string {
  const encoded = params.map((value: string) => {
    return encodeURIComponent(value)
      .replace(/!/g, "%21");
  });

  encoded[encoded.length - 1] = encodeURIComponent("status=") +
    encodeURIComponent(encoded[encoded.length - 1]);

  return encoded.join("%26");
}

function getSigningKey(
  apiSecret: string,
  accessTokenSecret: string,
): string {
  return `${encodeURIComponent(apiSecret.trim())}&${
    encodeURIComponent(accessTokenSecret.trim())
  }`;
}

async function postToTwitter(
  oAuthSignature: string,
  params: string[],
  tweet: string,
) {

  // Remove tweet from params as this is not needed in the OAuth header
  params.pop();

  // Add the generated OAuth signature as this is needed in the OAuth header
  params.push("oauth_signature=" + oAuthSignature);

  const authorizationHeader = "OAuth " + params.join(",");

  const res = await fetch(
    "https://api.twitter.com/1.1/statuses/update.json",
    {
      method: "POST",
      headers: {
        "Authorization": authorizationHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `status=${encodeURIComponent(tweet).replace(/!/g, "%21")}`,
    },
  );

  console.log(res);
}

function replaceTweetFields(tweet: string, title: string, repo: string): string {
  return tweet
    .replace("{{ title }}", title)
    .replace("{{ repo }}", repo);
}
