/**
 *
 * @param {import("octokit").Octokit} octokit
 * @param {string} workflow_id
 */
module.exports = async function getWorkflowById(
  octokit,
  owner,
  repo,
  workflow_id
) {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}",
    {
      owner,
      repo,
      workflow_id,
    }
  );

  return data;
};
