import * as core from "@actions/core";
import { Sync } from "./sync";

async function run(): Promise<void> {
  try {
    const token: string = core.getInput("github-token", { required: true });
    const projectsToken: string = core.getInput("projects-token") || token;

    const projectId: string = core.getInput("project-id");
    const fromColumns: string[] = core.getInput("from-columns").split(",");
    const toColumns: string[] = core
      .getInput("to-columns", { required: true })
      .split(",");

    new Sync(token, projectsToken, projectId, fromColumns, toColumns).run();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
