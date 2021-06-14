# set-cron-schedule-action

> Updates the current GitHub Action workflow's cron trigger based on a list of cron expressions

[![Build Status](https://github.com/gr2m/set-cron-schedule-action/workflows/Test/badge.svg)](https://github.com/gr2m/set-cron-schedule-action/actions)

## Usage

[cron expressions](https://en.wikipedia.org/wiki/Cron#CRON_expression) are powerful, but if you want to run a task on a specific date and time you are out of luck with GitHub Actions. The best you can do is to set a specific date and time that will trigger yearly.

With this action, you can programmatically update the cron schedule for an action. So instead of running your action frequently and then checking if there is anything to do, you can schedule the action to run on a specific date, then update the schedule to run on another date.

Note that [`${{ secrets.GITHUB_TOKEN}}`](https://docs.github.com/en/actions/reference/authentication-in-a-workflow) cannot be used for authentication, as it lacks the permission to update files in `.github/workflows/`. You need to [create a personal access token with the `workflow` scope](https://github.com/settings/tokens/new?scopes=workflow) and save it in your repository's secrets as `PAT_WITH_WORKFLOW_SCOPE` in order to make the example below work.

```yml
name: Reminder
on:
  schedule:
    - cron: "0 10 * * 2"

jobs:
  reminder:
    runs-on: ubuntu-latest
    steps:
      - run: do-the-thing.sh
      - uses: gr2m/set-cron-schedule-action@v1
        with:
          token: ${{ secrets.PAT_WITH_WORKFLOW_SCOPE }}
          cron: |
            0 10 * * 2
            0 15 * * 4
          # optional: set workflow id or file name
          workflow: my-workflow.yml
          # optional: Defaults to "ci($WORKFLOW_NAME): update cron schedule: $CRON_EXPRESSIONS".
          #           $WORKFLOW_NAME and $CRON_EXPRESSIONS will be replaced.
          message: "update cron for next reminder to do the thing"
```

## License

[ISC](LICENSE)
