# Supply chain & data auditing

This repository contains an Ethereum DApp to serve a decentralized autonomous organization to manage a mutualized flight insurance funds.

The user story is the following :

- As a normal user i can subscribe an insurance on a future existing flight
- As a token holder i can participate in the decentralized orgnisation by ammending settings on the platform and voting up insurance and oracle provider membership and own a share of the funds by the ability to redeem the token for a weighted percentage of the profits.
- As an activated insurance provider i can register new flights
- As an activated oracle provider i can settle flights.

[UML SCHEMES](url)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

In order to interact with the platform you will need 10 different addresses funded with tests ethers on the ethereum Rinkeby network.

You can fund these addresses from an ethereum [faucet](https://faucet.rinkeby.io/):

## Contract deployement workflow

1. deploy FlightSuretyApp
. uint256 \_tokenHolderMinBlockRequirement
. uint256 \_proposalValidBlockNum
2. deploy FlightSuretyOracle
. uint64 \_authorizedFlightDelay
3. deploy FlightSuretyData authorizing callers :
. address \_appContractAddress
. address \_oracleContractAddress
4. deploy OracleProviderRole authorizing callers :
. address \_appContractAddress
. address \_oracleContractAddress
5. deploy InsuranceProviderRole authorizing callers :
. address \_appContractAddress
6. deploy FlightSuretyShares authorizing callers :
. address \_appContractAddress
7. deploy InsuranceCoverageAmendmentProposal authroizing caller :
. address \_appContractAddress
. uint256 \_currentInsuranceCoverage
8. deploy MembershipFeeAmendmentProposal authorizing caller :
. address \_appContractAddress
. uint256 \_currentMembershipfee
7. initialize FlightSuretyApp referencing external contracts addresses :
. address \_flightSuretyData
. address \_insuranceCoverageAmendmentProposal
. address \_membershipFeeAmendmentProposal
. address \_insuranceProviderRole
. address \_oracleProviderRole
. address \_flighSuretyShares
8. initialize FlightSuretyOracle referencing external contracts addresses :
. address \_flightSuretyData
. address \_oracleProviderRole

## Config the app

In order to run the application you will need to create environnement files to refrences environnement variables and add the already deployed contract address to the supplychain contract abi.

```bash
# creating general environement file
echo -e "MNEMONIC=<YOUR MNEMONIC> PROVIDER_URL=<YOUR PROVIDER URL> SERVER_PORT=<SERVER PORT>" >> .env
```

```json
// replace network key in your contract abi when compiled

```

## Quickstart (DEV ENVIRONNEMENT)

### Install dependencies

```bash
# install general dependencies
npm i
```

```bash
# install client dependencies
cd ./client/
npm i
```

```bash
# install server dependencies
cd ./server/
npm i
```

### Lauch the smart contract test

```bash
# lauch ganache-cli
ganache-cli
# install client packages
npm run test
```

### Deploy the smart contracts

```bash
# deploy the contracts to localhost network
npm run migrate-dev
```

### Seed the smart contracts

```bash
# register the default 10 addresses provided by ganache as default configuration (account 1 as insurance provider and all accounts as oracle provider)
node ./seed/index.js
```

### Running the app (development)

```bash
# running the client app in dev environement (hot reloading enabled)
cd ./client
npm run start
```

```bash
# running the server app in dev environement (hot reloading enabled)
cd ./server
npm run dev
```

## Deployment (PROD ENVIRONNEMENT)

### Deploy the contract to ethereum rinkeby network

- Current rinkeby contract address: 0x7Cea407Aa29631256da085d892886E9B14b8bb13
- [Etherscan link to rinkeby contract](https://rinkeby.etherscan.io/address/0xe635af33AddA68f80c6973a8FAC6144fC3441FCd)

```bash
# deploy the contracts to rinkeby network
npm run migrate
```

### Build the app

```bash
# build the app
cd ./client
npm run build
```

## Troubleshoots

Known issues :

The migrations writes contract abis to the client directory, some of the time the the abis are not correctly exported.
Please double check and do not hesitate to run the migration command tw times.

## Dependencies

### environnement

- Ganache CLI v6.12.2 (ganache-core: 2.13.2)
- Truffle v5.4.0 (core: 5.4.0)
- Solidity - 0.8.0 (solc-js)
- Node v14.17.3
- Web3.js v1.4.0
- parcel ^v2.0.0

### smart contract

- @truffle/hdwallet-provider": "^1.0.35" (interact programmatically with a hierarchical deterministic wallet)
- "bignumber.js": "^9.0.1" (BigNum support in javascript)
- "chai": "^4.3.4" (assertion library for node js)
- "chai-bignumber": "^3.0.0" (assertion extension for chai library to support BigNum)
- "dotenv": "^10.0.0" (environnement variable manager)

### Client

  // material ui

- "@date-io/date-fns": "^1.3.13",
- "date-fns": "^2.23.0",
- "@material-ui/core": "^4.11.4",
- "@material-ui/data-grid": "^4.0.0-alpha.31",
- "@material-ui/icons": "^4.11.2",
- "@material-ui/lab": "^4.0.0-alpha.58",
- "@material-ui/pickers": "^3.3.10",

  // metamask

- "@metamask/detect-provider": "^1.2.0",

  // charting library

- "@nivo/core": "^0.73.0",
- "@nivo/pie": "^0.73.0",
- "capitalize": "^2.0.3",

  // animation library

- "lottie-react": "^2.1.0",

  // moment

- "moment": "^2.29.1",

  // react

- "react": "^17.0.2",
- "react-dom": "^17.0.2",
- "react-router-dom": "^5.2.0",
- "react-scripts": "4.0.3",
- "web-vitals": "^1.1.2",

  // web3

- "web3": "^1.3.6"

### Server

## Built With

- [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
- [IPFS](https://ipfs.io/) - IPFS is the Distributed Web | A peer-to-peer hypermedia protocol
  to make the web faster, safer, and more open.
- [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.

## Acknowledgments

- Solidity
- Ganache-cli
- Truffle
- IPFS
