const web3Contract = (provider, address, abi) => {
  return new provider.eth.Contract(abi, address);
};

const getPastEvents = async (contract, event, filter = null) => {
  const options = filter ? { fromBlock: 0, filter } : { fromBlock: 0 };
  return await contract
    .getPastEvents(event, options)
    .then((array) => array.map((element) => element.returnValues));
};

export { web3Contract, getPastEvents };
