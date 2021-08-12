const web3Contract = (provider, address, abi) => {
  const contract = new provider.eth.Contract(abi, address);
  const { fromWei, toWei } = provider.utils;
  contract.utils = { fromWei, toWei };
  contract.eth = provider.eth;
  return contract;
};

const getPastEvents = async (contract, event, filter = null) => {
  const options = filter ? { fromBlock: 0, filter } : { fromBlock: 0 };
  return await contract.getPastEvents(event, options).then((array) =>
    array.map((element) => ({
      transactionHash: element.transactionHash,
      blockNumber: element.blockNumber,
      ...element.returnValues,
    }))
  );
};

export { web3Contract, getPastEvents };
