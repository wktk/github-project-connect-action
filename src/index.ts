import * as core from "@actions/core";
import * as github from "@actions/github";

const token: string = core.getInput("github-token", { required: true });
const octokit: github.GitHub = new github.GitHub(token);

function findIssueReference(text: string): number | undefined {
  const match = text.match(
    /(?:connects?(?:\sto)?|close[sd]?|fixe?[sd]?|resolve[sd]?)\s+#(\d+)/
  );
  if (match) return Number(match[1]);
}

async function findCard(
  project: number,
  owner: string,
  repo: string,
  issue: number
): Promise<number | undefined> {
  const columns = await octokit.projects.listColumns({ project_id: project });
  for (const column of columns.data) {
    const cards = await octokit.projects.listCards({ column_id: column.id });
    for (const card of cards.data) {
      if (card.content_url.endsWith(`${owner}/${repo}/issues/${issue}`)) {
        return card.id;
      }
    }
  }
}

async function run(): Promise<void> {
  try {
    // Get the Pull Request
    const { owner, repo, number } = github.context.issue;
    const pull = await octokit.pulls.get({ owner, repo, pull_number: number });

    // Find the Issue # in the PR text
    const issue = findIssueReference(pull.data.title + pull.data.body);
    if (!issue) return console.log("No issue # found.");
    console.log(`Found: pull_request: #${number}, issue: ${issue}`);

    // Find a project card linked to the issue
    const project = Number(core.getInput("project-id", { required: true }));
    const cardId = await findCard(project, owner, repo, issue);
    const columnId = Number(core.getInput("to-columns", { required: true }));
    if (!cardId) return console.log("No project cards fond.");
    console.log(`Found a card ${cardId} to be moved to ${columnId}`);

    // Move the card
    octokit.projects.moveCard({
      card_id: cardId,
      column_id: columnId,
      position: "top"
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
