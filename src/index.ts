import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";

const token: string = core.getInput("github-token", { required: true });
const octokit: github.GitHub = new github.GitHub(token);

function findIssueReference(text: string): number | undefined {
  const match = text.match(
    /(?:[Cc]onnects?(?:\sto)?|[Cc]lose[sd]?|[Ff]ixe?[sd]?|[Rr]esolve[sd]?)\s+#(\d+)/,
  );
  if (match) return Number(match[1]);
}

async function findCard(
  project: number,
  owner: string,
  repo: string,
  issue: number,
): Promise<number | undefined> {
  const columns = await octokit.projects.listColumns({ project_id: project });
  for (const column of columns.data) {
    const cards = await octokit.projects.listCards({ column_id: column.id });
    for (const card of cards.data) {
      if (card.content_url?.endsWith(`${owner}/${repo}/issues/${issue}`)) {
        return card.id;
      }
    }
  }
}

async function parseProjectURL(input: string): Promise<[number, number]> {
  const url = new URL(input);
  const [, type, name] = url.pathname.split("/");

  let projects: Promise<Octokit.Response<Octokit.ProjectsListForRepoResponse>>;
  if (type === "orgs") {
    projects = octokit.projects.listForOrg({ org: name });
  } else if (type === "users") {
    projects = octokit.projects.listForUser({ username: name });
  } else {
    projects = octokit.projects.listForRepo({ owner: type, repo: name });
  }

  const project = (await projects).data.find((project) =>
    project.html_url.endsWith(url.pathname),
  );
  const column = url.hash.match(/#column-(\d+)/);
  if (!project || !column) throw "Invalid column URL";
  return [project.id, Number(column[1])];
}

async function run(): Promise<void> {
  try {
    const columnUrl = core.getInput("column-url");
    const [project, columnId] =
      columnUrl != ""
        ? await parseProjectURL(columnUrl)
        : [
            Number(core.getInput("project-id", { required: true })),
            Number(core.getInput("to-column")) || // depreacted
              Number(core.getInput("column-id", { required: true })),
          ];

    // Get the Pull Request (or Issue)
    const { owner, repo, number } = github.context.issue;
    const pull = await octokit.issues.get({
      owner,
      repo,
      issue_number: number,
    });

    // Find the Issue # in the PR text
    const issue = findIssueReference(pull.data.title + pull.data.body);
    if (!issue) return console.log("No issue # found.");
    console.log(`pull_request #${number} refers to issue #${issue}`);

    // Find a project card linked to the issue
    const cardId = await findCard(project, owner, repo, issue);
    if (!cardId) return console.log("No project cards fond.");

    // Move the card
    console.log(`Moving card (ID: ${cardId}) to column (ID: ${columnId})`);
    octokit.projects.moveCard({
      card_id: cardId,
      column_id: columnId,
      position: "top",
    });
  } catch (error) {
    if (typeof error === "string") {
      core.setFailed(error);
    } else if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("Unknown error occurred");
    }
  }
}

run();
