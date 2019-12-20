import * as github from "@actions/github";

export class Sync {
  private client: github.GitHub;
  private projectsClient: github.GitHub;

  constructor(
    token: string,
    projectsToken: string,
    public projectId: string,
    public fromColumns: string[],
    public toColumns: string[]
  ) {
    this.client = new github.GitHub(token);
    this.projectsClient = new github.GitHub(projectsToken);
  }

  run(): string {
    return "TODO";
  }
}
