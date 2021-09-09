import React, { useState, useEffect } from "react";
import VotingSystemContract from "./contracts/VotingSystem.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () => {
  const [candidates, setCandidates] = useState([])
  const [electionStarted, setElectionStarted] = useState()
  const [blockchain, setBlockchain] = useState({})
  const [web3, setWeb3] = useState(null)

  // fetches all data from blockchain
  const getCandidateData = async () => {
    const candidates = await blockchain.contract.methods.getCandidates().call()
    const electionStarted = await blockchain.contract.methods.electionHasStarted().call()

    const candidateData = candidates.map(async element => {
      const name = await blockchain.contract.methods.getCandidateName(element).call()
      const numVotes = await blockchain.contract.methods.getCandidateVotes(element).call()
      return {
        name: name,
        votes: numVotes
      }
    })

    Promise.all(candidateData).then(output => setCandidates(output))
    setElectionStarted(electionStarted)
  }

  // useEffect(() => {
  //   const getMetamaskData = async () => {
  //     const accounts = await web3.eth.getAccounts()
  //     const networkId = await web3.eth.net.getId()
  //     const deployedNetwork = VotingSystemContract.networks[networkId]

  //     const instance = new web3.eth.Contract(
  //       VotingSystemContract.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     );

  //     const candidates = await instance.methods.getCandidates().call()
  //     const electionStarted = await instance.methods.electionHasStarted().call()

  //     // get info for every candidate and set it to state
  //     const candidateData = candidates.map(async element => {
  //       const name = await instance.methods.getCandidateName(element).call()
  //       const numVotes = await instance.methods.getCandidateVotes(element).call()
  //       return {
  //         name: name,
  //         votes: numVotes
  //       }
  //     })

  //     // set candidates state
  //     Promise.all(candidateData).then(output => setCandidates(output))

  //     // set electionStarted state
  //     setElectionStarted(electionStarted)

  //     // set blockchain state
  //     setBlockchain({
  //       account: accounts[0],
  //       contract: instance
  //     })
  //   }

  //   // if web3 provider injected
  //   if (web3) {
  //     getMetamaskData()
  //   }

  // }, [web3])

  // NOTE: left off trying to figure out how to elegantly connect metamask
  // and show the user prompts if metamask is not connected

  // injects web3 provider and gets blockchain data
  useEffect(() => {
    const getProvider = async () => {
      const web3 = await getWeb3()

      const accounts = await web3.eth.getAccounts()
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = VotingSystemContract.networks[networkId]

      const instance = new web3.eth.Contract(
        VotingSystemContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const candidates = await instance.methods.getCandidates().call()
      const electionStarted = await instance.methods.electionHasStarted().call()

      // get info for every candidate and set it to state
      const candidateData = candidates.map(async element => {
        const name = await instance.methods.getCandidateName(element).call()
        const numVotes = await instance.methods.getCandidateVotes(element).call()
        return {
          name: name,
          votes: numVotes
        }
      })

      Promise.all(candidateData).then(output => setCandidates(output))

      setElectionStarted(electionStarted)

      setBlockchain({
        web3: web3,
        account: accounts[0],
        contract: instance
      })
    }

    getProvider()

  }, [])

  // run a candidate
  const onRunCandidate = async () => {
    await blockchain.contract.methods.runCandidate("Alexander").send({ from: blockchain.account })

    getCandidateData()
  }

  const onUnRunCandidate = async () => {
    await blockchain.contract.methods.unRunCandidate().send({ from: blockchain.account })

    getCandidateData()
  }

  const getProvider = async () => {
    const web3 = await getWeb3()

    setWeb3(web3)
  }

  return (
    <div className="custom-background">
      <div className="container">
        <div className="row justify-content-center" style={{ paddingTop: "8%" }}>
          <div className="col">
            <h1 className="text-center">
              Welcome to Decentralized Voting!
            </h1>
            <h5 className="text-center mt-5">
              This application allows you to participate in an election
              via you Metamask wallet. Every election will have a unique purpose/description,
              which will be shown on this page.
            </h5>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col">
            <p className="text-center">Connect your MetaMask Wallet to get started!</p>
          </div>
          <div className="col d-flex justify-content-center">
            <button
              className="btn btn-primary"
              onClick={() => getProvider()}>
              Connect to MetaMask
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
