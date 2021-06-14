const { test } = require("tap");

const { readdirSync } = require("fs");

const currentEnv = { ...process.env };

let index = 0;
for (const file of readdirSync("test")) {
  if (!/test.js/.test(file)) continue;

  test(file, async (t) => {
    console.log(file, ++index);
    process.env = currentEnv;
    await t.resolves(require(`./${file}`));
  });
}
