import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    const injectWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum)
        try {
          //await window.ethereum.enable()
          await window.ethereum.request({ method: "eth_requestAccounts" })

          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else {
        reject("Web3 provider not found")
      }
    }

    injectWeb3()
  });

export default getWeb3;
