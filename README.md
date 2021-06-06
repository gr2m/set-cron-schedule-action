# iterate-cron-action

> Updates the current GitHub Action workflow's cron trigger based on a list of cron expressions

[![Build Status](https://github.com/gr2m/iterate-cron-action/workflows/Test/badge.svg)](https://github.com/gr2m/iterate-cron-action/actions)

## Usage

[cron expressions](https://en.wikipedia.org/wiki/Cron#CRON_expression) are powerful, but if you want to run a task on Tuesday morning at 10am and Thursday afternoon at 3pm each week, you are out of luck. This action persmits you to set a list of cron expressions, by iterating through a provided list each time the workflow is run and updating the workflow file itself

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
      - uses: gr2m/iterate-cron-action@v1
        with:
          token: ${{ secrets.PAT_WITH_WORKFLOW_SCOPE }}
          crons: |
            0 10 * * 2
            0 15 * * 4
          # optional: Defaults to "ci($WORKFLOW_NAME): update cron expression to $CRON_EXPRESSION".
          #           $WORKFLOW_NAME and $CRON_EXPRESSION will be replaced.
          message: "update cron for next reminder to do the thing"
```

## License

[ISC](LICENSE)
