const { readFileSync } = require("fs");

const nock = require("nock");

nock.disableNetConnect();

process.env = {
  ...process.env,
  GITHUB_TOKEN: "secret",
  GITHUB_REPOSITORY: "gr2m/iterate-cron-action",
  GITHUB_WORKFLOW: "Reminder",
  INPUT_CRONS: ["0 10 * * 2", "0 15 * * 4"].join("\n"),
};

nock("https://api.github.com", {
  reqheaders: {
    authorization: "token secret",
  },
})
  .get("/repos/gr2m/iterate-cron-action/actions/workflows")
  .reply(200, [
    {
      name: "Reminder",
      path: ".github/workflows/reminder.yml",
    },
  ])

  .get(
    "/repos/gr2m/iterate-cron-action/contents/.github%2Fworkflows%2Freminder.yml"
  )
  .reply(200, {
    content: readFileSync("./test/fixtures/reminder.yml", "base64"),
    sha: "sha123",
  })

  .put(
    "/repos/gr2m/iterate-cron-action/contents/.github%2Fworkflows%2Freminder.yml",
    {
      content: readFileSync("./test/fixtures/reminder-updated.yml", "base64"),
      message: "ci(Reminder): update cron expression to `0 15 * * 4`",
      sha: "sha123",
    }
  )
  .reply(201);

require("..");
