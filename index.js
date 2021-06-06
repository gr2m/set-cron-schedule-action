const { Octokit } = require("octokit");
const core = require("@actions/core");
const yaml = require("js-yaml");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = main().catch((error) => {
  console.log(error);
  core.setFailed(error.message);
});

async function main() {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const token = core.getInput("token");
  const cronExpressions = core.getInput("crons").split("\n");
  const message =
    core.getInput("message") ||
    "ci($WORKFLOW_NAME): update cron expression to `$CRON_EXPRESSION`";

  const octokit = new Octokit({
    auth: token,
    userAgent: "iterate-cron-action",
    retry: { enabled: false },
  });

  // get current workflow path by name
  const workflows = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/workflows",
    {
      owner,
      repo,
    }
  );
  const currentWorkflow = workflows.find(
    (workflow) => workflow.name === process.env.GITHUB_WORKFLOW
  );

  // get current workflow
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path: currentWorkflow.path,
    }
  );
  const workflow = yaml.load(Buffer.from(data.content, "base64").toString());

  // update cron expression in workflow
  const currentExpression = workflow.on.schedule[0].cron;
  const currentIndex = cronExpressions.indexOf(currentExpression);
  const nextExpression =
    cronExpressions[(currentIndex + 1) % cronExpressions.length];

  workflow.on.schedule[0].cron = nextExpression;

  const newContent = yaml.dump(workflow, {
    quotingType: '"',
  });

  // update workflow file
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: currentWorkflow.path,
    content: Buffer.from(newContent).toString("base64"),
    message: message
      .replace("$WORKFLOW_NAME", process.env.GITHUB_WORKFLOW)
      .replace("$CRON_EXPRESSION", nextExpression),
    sha: data.sha,
  });

  console.log("workflowfile updated");
}
