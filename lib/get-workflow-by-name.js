module.exports = async function getWorkflowByName(octokit, owner, repo, name) {
  // get current workflow path by name
  const workflows = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/workflows",
    {
      owner,
      repo,
    }
  );
  const currentWorkflow = workflows.find((workflow) => workflow.name === name);

  /* istanbul ignore if */
  if (!currentWorkflow) {
    throw new Error('No workflow with name "%s" found', name);
  }

  return currentWorkflow;
};
