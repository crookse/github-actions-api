import { argParser } from "./arg_parser.ts";

interface IHttpOptions {
  access_token: string;
  post: IPost;
}

interface IPost {
  title: string;
  url: string;
}

const args = argParser(Deno.args.slice());
const username = args[0];
const password = args[1];
const appId = args[2];
const appSecret= args[3];
const repo = args[4];

await postToReddit({
  access_token: await getAccessToken(),
  post: buildPost(repo),
});


////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function buildPost(repo: string): IPost {
  let post: IPost = {
    title: "New {{ title }} version released!",
    url: "https://github.com/drashland/{{ repo }}/releases/latest",
  };

  switch (repo) {
    case "dawn":
      return replacePostFields(post, "Dawn", repo);
    case "dmm":
      return replacePostFields(post, "dmm", repo);
    case "deno-drash":
      return replacePostFields(post, "Drash", repo);
    case "rhum":
      return replacePostFields(post, "Rhum", repo);
    case "wocket":
      return replacePostFields(post, "Wocket", repo);
  }

  throw new Error("Unknown module specified");
}

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://www.reddit.com/api/v1/access_token`,
    {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${appId}:${appSecret}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=password&username=${username}&password=${password}`,
    },
  );

  const json = await res.json();

  return json.access_token;
}

async function postToReddit(options: IHttpOptions) {
  const res = await fetch(
    "https://oauth.reddit.com/api/submit",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + options.access_token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `kind=link&title=${options.post.title}&sr=Deno&url=${options.post.url}`,
    },
  );

  console.log(res);
}

function replacePostFields(post: IPost, title: string, repo: string): IPost {
  post.title = post.title.replace("{{ title }}", title);
  post.url = post.url.replace("{{ repo }}", repo);
  return post;
}
