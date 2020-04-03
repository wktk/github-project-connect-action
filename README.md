# GitHub Project Connect Action

Connect Pull Request statuses to Issues on GitHub Project boards.

This idea is inspired by Waffle.io, which has shut down in 2019.

## Configuration

### Inputs

- `github-token`: GitHub API token with `repo` access.
  - :warning: `secrets.GITHUB_TOKEN` can't be used as this actions uses an preview API.  Obtain it from [Personal access tokens].
- `project-id`: Numeric ID of the target GitHub Project.
  - :warning: It doesn't appear in URL.  Find it from the API (see below).
- `to-column`: Numeric ID of the destiation column.
  - :warning: It doesn't appear in URL.  Find it from the API (see below).

```sh
# Find a Project Id (User)
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
      - name: When pull_request review_requested, move the connected issue to the Reviewing column
        if: github.event_name == 'pull_request' && github.event.action == 'review_requested'
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564172

      - name: When pull_request_review approved, move the connected issue to the Ready column
        if: github.event_name == 'pull_request_review' && github.event.review.state == 'approved'
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564173

      - name: When pull_request merged, move the connected issue to the Done column
        if: github.event_name == 'pull_request' && github.event.pull_request.merged_at != ''
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564174
```
