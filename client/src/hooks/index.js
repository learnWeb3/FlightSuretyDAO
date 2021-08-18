import { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";

// internal state of the component
const useComponentState = () => {
  const [state, setState] = useState({ status: "loaded", code: null });
  return {
    state,
    setState,
  };
};

// make web3 provider and accounts available for component using this hook
const useProvider = (setState) => {
  const [provider, setProvider] = useState();
  const [selectedAddress, setSelectedAddress] = useState();
  useEffect(() => {
    const getAndSetProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        provider.on("accountsChanged", function (accounts) {
          setSelectedAddress(accounts[0]);
        });

        provider.on("disconnect", function () {
          setSelectedAddress(null);
        });
        provider.on("connect", async function () {
          const _accounts = await provider.request({
            method: "eth_requestAccounts",
          });
          setSelectedAddress(provider.selectedAddress);
        });
        const web3 = new Web3(provider);
        setProvider(web3);
        if (web3) {
          try {
            const _accounts = await provider.request({
              method: "eth_requestAccounts",
            });
            setSelectedAddress(_accounts[0]);
          } catch (error) {
            setState({
              status: "error",
              code: 499,
              message: "Please authorize our app to interact with your wallet",
            });
          }
        }
      } else {
        const web3 = new Web3("ws://localhost:8545");
        setProvider(web3);
        const _accounts = await web3.eth.getAccounts();
        _accounts.length > 0
          ? _accounts.length > 0 && setSelectedAddress(_accounts[0])
          : setState({ status: "error", code: 500 });
      }
    };
    getAndSetProvider();
  }, [selectedAddress]);

  return {
    provider,
    selectedAddress,
  };
};

export { useProvider, useComponentState };
