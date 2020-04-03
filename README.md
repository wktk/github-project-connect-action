# GitHub Project Connect Action

Connect Pull Request statuses to Issues on GitHub Project boards.

## Configuration

```yaml
name: github-project-connect-action
on:
  pull_request:
    types: [review_requested closed]
  pull_request_review:
    types: [submitted]

jobs:
  connect:
    runs-on: ubuntu-latest
    steps:
      - name: When pull_request review_requested, move the connected issue to the Reviewing column
        if: github.event_name == "pull_request" && github.event.action == "review_requested"
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564172

      - name: When pull_request_review approved, move the connected issue to the Ready column
        if: github.event_name == "pull_request_review" && github.event.review.state == "approved"
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564173

      - name: When pull_request merged, move the connected issue to the Done column
        if: github.event_name == "pull_request" && github.event.pull_request.merged_at != ""
        uses: wktk/github-project-connect-action@master
        with:
          github-token: ${{ secrets.SYNC_REPO_TOKEN }}
          project-id: 4226438
          to-column: 8564174
```
