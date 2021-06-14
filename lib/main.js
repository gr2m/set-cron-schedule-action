const core = require("@actions/core");
const { Octokit } = require("octokit");
const yaml = require("js-yaml");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin

const getWorkflowByName = require("./get-workflow-by-name");
const getWorkflowById = require("./get-workflow-by-id");

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async function main() {
  /* istanbul ignore if */
  if (!process.env.GITHUB_WORKFLOW) {
    throw new Error("GITHUB_WORKFLOW must be set to workflow name");
  }
  /* istanbul ignore if */
  if (!process.env.GITHUB_REPOSITORY) {
    throw new Error("GITHUB_REPOSITORY must be set");
  }

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  const token = core.getInput("token", { required: true });
  const newExpressions = core.getInput("cron", { required: true }).split("\n");
  const workflowIdOrName = core.getInput("workflow");
  const message =
    core.getInput("message") ||
    "ci($WORKFLOW_NAME): update cron schedule: $CRON_EXPRESSIONS";

  const octokit = new Octokit({
    auth: token,
    userAgent: "set-cron-schedule-action",
    retry: { enabled: false },
  });

  // get current workflow path by name
  const currentWorkflow = workflowIdOrName
    ? await getWorkflowById(octokit, owner, repo, workflowIdOrName)
    : await getWorkflowByName(
        octokit,
        owner,
        repo,
        process.env.GITHUB_WORKFLOW
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
  const currentExpressions = workflow.on.schedule.map(
    (schedule) => schedule.cron
  );

  if (currentExpressions.join("\n") === newExpressions.join("\n")) {
    console.log("No change to current cron schedule: %j", currentExpressions);
    return;
  }

  workflow.on.schedule = newExpressions.map((cron) => ({ cron }));

  const newContent = yaml
    .dump(workflow, {
      quotingType: '"',
    })
    // remove quotes around `on:`
    .replace(/\n"on":/, "\non:");

  // update workflow file
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path: currentWorkflow.path,
    content: Buffer.from(newContent).toString("base64"),
    message: message
      .replace("$WORKFLOW_NAME", workflow.name)
      .replace("$CRON_EXPRESSIONS", newExpressions.join(", ")),
    sha: data.sha,
  });

  console.log('Schedule for "%s" set to: %j', workflow.name, newExpressions);
};
