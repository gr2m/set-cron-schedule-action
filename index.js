const core = require("@actions/core");
const dotenv = require("dotenv");

const main = require("./lib/main");

dotenv.config();

module.exports = main().catch((error) => {
  console.log(error);
  core.setFailed(error.message);
});
