const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// dotenv
const envPath = process.cwd() + "/../.env";
require("dotenv").config({ path: envPath });
// environnent variables
const { PROVIDER_URL } = process.env;
// init cron tasks helper function
const { initCronTasks } = require("./src/index.js");
// ask user to provider wallet MNEMONIC and init cron task to create secure auditable request for settlement data to a randomly selected oracle provider
rl.question("Please enter your ether wallet mnemonic: \n", (MNEMONIC) => {
  if (
    (MNEMONIC && MNEMONIC.match(/\w+/g)?.length === 12) ||
    MNEMONIC.match(/\w+/g)?.length === 24
  ) {
    console.log("Thanks, verifying wallet mnemonic...");
    initCronTasks(MNEMONIC, PROVIDER_URL);
  } else {
    console.log("Invalid mnemonic aborting ...");
    rl.close();
  }
});
