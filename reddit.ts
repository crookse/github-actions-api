const args = Deno.args.slice();
const username = args[0];
const password = args[1];
const appId = args[2];
const appSecret= args[3];
const moduleName = args[4];

let postTitle: string;
let postText: string;
let postUrl: string;

switch (moduleName) {
  case "drash":
    postTitle = "New Drash version released!";
    postText = "Check out our latest release @ https://github.com/drashland/deno-drash/releases/latest";
    postUrl = "https://drash.land/drash";
    break;
  default:
    throw new Error("Unknown module specified.");
}

const accessToken = await getBearerToken();
await post(accessToken);


////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

async function getBearerToken(): Promise<string> {
  const res = await fetch(
    `https://www.reddit.com/api/v1/access_token?grant_type=password&username=${username}&password=${password}`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${appId}:${appSecret}`),
      }
    }
  );

  const json = await res.json();

  return json.access_token;
}

async function post(accessToken: string) {
  const res = await fetch(
    "https://oauth.reddit.com/api/submit",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `kind=link&title=${postTitle}&sr=Deno&text=${postText}&url=${postUrl}`,
    },
  );

  console.log(res);
}
