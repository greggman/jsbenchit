import { Octokit } from '@octokit/rest';

const userAgent = 'jsBenchIt v0.0.1';

const getGistContent = gist => JSON.parse(gist.files['jsBenchIt.json'].content);

export default class GitHub extends EventTarget {
  constructor() {
    super();
    this.pat = '';
    this.user = {};
    this.unAuthorizedOctokit = new Octokit({
      userAgent,
    });
  }
  get octokit() {
    return this.authorizedOctokit || this.unAuthorizedOctokit;
  }
  _updateUserData(data) {
    if (data.owner) {
      this.user.name = data.owner.login;
      this.user.avatarURL = data.owner.avatar_url;
      const event = new Event('userdata');
      event.data = {...this.user};
      this.dispatchEvent(event);
    }
  }
  setPat(pat) {
    if (pat !== this.pat) {
      this.pat = pat;
      this.authorizedOctokit = new Octokit({
        auth: pat,
        userAgent,
      });
    }
  }
  async getUserGists() {
    const gists = await this.authorizedOctokit.paginate(this.authorizedOctokit.gists.list);
    return gists.filter(gist => !!gist.files['jsBenchIt.json']);
    // return await this.authorizedOctokit.gists.list();
  }
  async getAnonGist(gist_id) {
    const {data, rawData} = await getAnonGist(gist_id);
    this._updateUserData(rawData);
    return {data, rawData};
  }
  async getUserGist(gist_id) {
    const gist = await this.octokit.gists.get({gist_id});
    this._updateUserData(gist.data);
    return getGistContent(gist.data);
  }
  async createGist(data) {
    const gist = await this.authorizedOctokit.gists.create({
      description: data.title,
      public: true,
      files: {
        'jsBenchIt.json': {content: JSON.stringify(data)},
      },
    });
    this._updateUserData(gist.data);
    return {
      id: gist.data.id,
      name: gist.data.description,
      date: gist.data.updated_at,
    };
  }
  /* returns 
{status: 201, url: "https://api.github.com/gists", headers: {…}, data: {…}}
data:
comments: 0
comments_url: "https://api.github.com/gists/92d9e8b2a5215b0217d459e735a9226b/comments"
commits_url: "https://api.github.com/gists/92d9e8b2a5215b0217d459e735a9226b/commits"
created_at: "2020-10-04T10:46:14Z"
description: "bench test"
files: {bench.json: {…}}
forks: []
forks_url: "https://api.github.com/gists/92d9e8b2a5215b0217d459e735a9226b/forks"
git_pull_url: "https://gist.github.com/92d9e8b2a5215b0217d459e735a9226b.git"
git_push_url: "https://gist.github.com/92d9e8b2a5215b0217d459e735a9226b.git"
history: [{…}]
html_url: "https://gist.github.com/92d9e8b2a5215b0217d459e735a9226b"
id: "92d9e8b2a5215b0217d459e735a9226b"
node_id: "MDQ6R2lzdDkyZDllOGIyYTUyMTViMDIxN2Q0NTllNzM1YTkyMjZi"
owner: {login: "greggman", id: 234804, node_id: "MDQ6VXNlcjIzNDgwNA==", avatar_url: "https://avatars2.githubusercontent.com/u/234804?v=4", gravatar_id: "", …}
public: true
truncated: false
updated_at: "2020-10-04T10:46:14Z"
url: "https://api.github.com/gists/92d9e8b2a5215b0217d459e735a9226b"
user: null
headers: {cache-control: "private, max-age=60, s-maxage=60", content-length: "4814", content-type: "application/json; charset=utf-8", etag: ""124f123e0d75b88fa385c1e1edab1608fd7dd6624440f456cb0b3d92634e1fd9"", location: "https://api.github.com/gists/92d9e8b2a5215b0217d459e735a9226b", …}
status: 201
url: "https://api.github.com/gists"
  */
  async updateGist(gist_id, data, isPublic = true) {
    const gist = await this.authorizedOctokit.gists.update({
      gist_id,
      description: data.title,
      files: {
        'jsBenchIt.json': {
          content: JSON.stringify(data),
          filename: 'jsBenchIt.json',
        },
      },
    });
    return {
      id: gist.data.id,
      name: gist.data.description,
      date: gist.data.updated_at,
    };
  }
}

export async function getAnonGist(gist_id) {
  const req = await fetch(`https://api.github.com/gists/${gist_id}`);
  const gist = await req.json();
  return {
    data: getGistContent(gist),
    rawData: gist,
  };
}
