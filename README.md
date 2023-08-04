# GitHub Project Connect Action

Connect Pull Request statuses to Issues on GitHub Project (classic) boards.

This idea is inspired by Waffle.io, which has shut down in 2019.

## Configuration

### Inputs

#### Authentication
- `github-token` *required*: GitHub API token with `repo` access.
  - :warning: `secrets.GITHUB_TOKEN` can't be used as this actions uses an preview API.  Obtain one from [Personal access tokens].

#### Configuration

There are two ways to specify a project and a column where to move cards.  URL or ID is required.

##### URL

- `column-url` *required (if you use URL)*: URL of the column to move cards.

<img src="https://raw.githubusercontent.com/wktk/github-project-connect-action/9b857228c249bb63f31431c3bf3067c9d095a6d5/misc/column-id.gif" width="360">

##### ID

- `project-id` *requried (if you use ID)*: Numeric ID of the target GitHub Project.
  - :warning: It doesn't appear in URL.  Find it from the API (see below).
- `column-id` *required (if you use ID)*: Numeric ID of the destiation column.
  - It appears in URL but you can also find it from the API (see below).

```sh
# Find a Project ID (User)
curl --silent \
  -H "accept: application/vnd.github.inertia-preview+json" \
  -H "authorization: token <your_github_token>" \
  https://api.github.com/users/<user_name>/projects \
| jq ".[] | { id: .id, name: .name, html_url: .html_url }"

# Find a Project ID (Organization)
curl --silent \
  -H "accept: application/vnd.github.inertia-preview+json" \
  -H "authorization: token <your_github_token>" \
  https://api.github.com/orgs/<org_user_name>/projects \
| jq ".[] | { id: .id, name: .name, html_url: .html_url }"

# Find a column ID
curl --silent \
  -H "accept: application/vnd.github.inertia-preview+json" \
  -H "authorization: token <your_github_token>" \
  https://api.github.com/projects/<project_id>/columns \
| jq ".[] | { id: .id, name: .name }"
```

[Personal access tokens]: https://github.com/settings/tokens

### Example

```yaml
name: github-project-connect-action
on:
  pull_request:
    types: [review_requested, closed]
  pull_request_review:
    types: [submitted]

jobs:
  connect:
    runs-on: ubuntu-latest
    steps:
      - name: When pull_request is review_requested, move the connected issue to the Reviewing column
        if: github.event_name == 'pull_request' && github.event.action == 'review_requested'
        uses: wktk/github-project-connect-action@v1
        with:
          github-token: ${{ secrets.REPO_TOKEN }}
          column-url: https://github.com/users/wktk/projects/1#column-8564172

      - name: When pull_request_review is approved, move the connected issue to the Ready column
        if: github.event_name == 'pull_request_review' && github.event.review.state == 'approved'
        uses: wktk/github-project-connect-action@v1
        with:
          github-token: ${{ secrets.REPO_TOKEN }}
          column-url: https://github.com/wktk/sandbox/projects/1#column-5250623

      - name: When pull_request is merged, move the connected issue to the Done column
        if: github.event_name == 'pull_request' && github.event.pull_request.merged_at != ''
        uses: wktk/github-project-connect-action@v1
        with:
          github-token: ${{ secrets.REPO_TOKEN }}
          # Instead of URL you may use ID
          project-id: 4226438
          column-id: 8564174
```
