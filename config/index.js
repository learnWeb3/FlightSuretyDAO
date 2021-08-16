// copying deployed contract abi to client directory
const fs = require("fs");

const deployedContractNames = [
  "FlightSuretyApp",
  "FlightSuretyOracle",
  "FlightSuretyShares",
];

deployedContractNames.map((filename) => {
  const data = fs.readFileSync(
    process.cwd() + "/build/contracts/" + filename + ".json"
  );
  fs.writeFileSync(
    process.cwd() + "/client/src/contracts/" + filename + ".json",
    data
  );
});

console.log("contracts abi exported with success");
