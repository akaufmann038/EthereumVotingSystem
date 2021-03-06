import React, { useState, useEffect } from "react";
import VotingSystemContract from "./contracts/VotingSystem.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const App = () => {
  const [candidates, setCandidates] = useState([])
  const [electionStarted, setElectionStarted] = useState()
  const [electionDescription, setElectionDescription] = useState()
  const [blockchain, setBlockchain] = useState(null)
  const [stateWeb3, setStateWeb3] = useState(null)

  // fetches all data from blockchain and updates state
  const getCandidateData = async () => {
    const candidates = await blockchain.contract.methods.getCandidates().call()
    const electionStarted = await blockchain.contract.methods.electionStarted().call()
    const electionDescription = await blockchain.contract.methods.electionDescription().call()

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
    setElectionDescription(electionDescription)
  }

  //injects web3 provider and gets blockchain data
  useEffect(() => {
    const getProvider = async () => {
      if (stateWeb3) {
        const accounts = await stateWeb3.eth.getAccounts()

        const networkId = await stateWeb3.eth.net.getId()

        const deployedNetwork = VotingSystemContract.networks[networkId]

        const instance = new stateWeb3.eth.Contract(
          VotingSystemContract.abi,
          deployedNetwork && deployedNetwork.address,
        );

        try {
          const candidates = await instance.methods.getCandidates().call()
          const electionStarted = await instance.methods.electionStarted().call()
          const electionDescription = await instance.methods.electionDescription().call()
          const owner = await instance.methods.owner().call()


          // get info for every candidate and set it to state
          const candidateData = candidates.map(async element => {
            const name = await instance.methods.getCandidateName(element).call()
            const numVotes = await instance.methods.getCandidateVotes(element).call()
            return {
              name: name,
              votes: numVotes
            }
          })
          // set candidate state
          Promise.all(candidateData).then(output => setCandidates(output))

          // set electionStarted state
          setElectionStarted(electionStarted)

          // set electionDescription
          setElectionDescription(electionDescription)

          // set blockchain data state
          setBlockchain({
            account: accounts[0],
            contract: instance,
            contractOwner: owner
          })
        } catch (error) {
          alert("Failed to querry data from smart contract. Make sure your MetaMask account is connected to the right network.")
          console.log(error)
        }

      }
    }

    getProvider()

  }, [stateWeb3])

  // injects web3 provider
  const getProvider = async () => {
    try {
      const web3 = await getWeb3()

      // set web3 state
      await setStateWeb3(web3)
    } catch (error) {
      alert("Failed to inject Web3. Make sure MetaMask is working in your browser.")
      console.log(error)
    }
  }

  // start election
  const onStartElection = async () => {
    await blockchain.contract.methods.beginElection().send({ from: blockchain.account })

    getCandidateData()
  }

  return (
    <div className="custom-background">
      <div className="container">
        <div className="row justify-content-center" style={{ paddingTop: "8%" }}>
          <div className="col">
            <h1 className="text-center fw-bold display-5">
              Welcome to Decentralized Voting!
            </h1>
            <h5 className="text-center mt-3 lead">
              This application allows you to participate in an election
              via your Metamask wallet. Every election will have a unique purpose/description,
              which will be shown on this page. If the election has not yet started, use the interface below
              to run in the election. If voting has started, vote for your preferred candidate!
              If you are the contract owner, you will be able to
              start and end voting and reset the election with a new description.
            </h5>
          </div>
        </div>
        {blockchain ?
          <>
            {electionStarted ?
              <div className="row mt-3">
                <div className="col d-flex justify-content-center">
                  <h1>The election has started! Vote below!</h1>
                </div>
              </div>
              :
              <>
                <div className="row mt-3">
                  <div className="col d-flex justify-content-center">
                    <h1>The election has not started!</h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col text-center">
                    <h3 className="lead">{electionDescription}</h3>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col d-flex justify-content-center">
                    <InputName blockchain={blockchain} getCandidateData={getCandidateData} />
                  </div>
                  {(blockchain.contractOwner === blockchain.account) ?
                    <>
                      <div className="col d-flex justify-content-center">
                        <button className="btn btn-primary" onClick={onStartElection}>Begin Election</button>
                      </div>
                      <div className="col d-flex justify-content-center">
                        <InputDescription blockchain={blockchain} getCandidateData={getCandidateData} />
                      </div>
                    </>
                    :
                    <></>}
                </div>
              </>
            }

            <div className="row mt-5">
              {candidates.map((element, key) => {
                return (
                  <div className="col" key={key}>
                    <div className="card text-center">
                      <div className="card-header">
                        Candidate {key}
                      </div>
                      <div className="card-body">
                        <h5>{element.name}</h5>
                        {electionStarted ?
                          <>
                            <h5>Votes: {element.votes}</h5>
                            {/* left off here!!! do btn onClick */}
                            <button className="btn btn-primary">Vote for candidate {key}</button>
                          </>
                          :
                          <></>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
          :
          <div className="row mt-5">
            <div className="col">
              <p className="text-center">Make sure you are connected to the Truffle
                Develop Network in your MetaMask wallet. Then, click the button to
                connect your wallet!
              </p>
            </div>
            <div className="col d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => getProvider()}>
                Connect to MetaMask
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  )
}

export default App;

const InputName = ({ blockchain, getCandidateData }) => {
  const [inputName, setInputName] = useState("")

  // run a candidate
  const onRunCandidate = async (e) => {
    e.preventDefault()
    try {
      await blockchain.contract.methods.runCandidate(inputName).send({ from: blockchain.account })
    } catch (error) {
      console.log(error)
    }

    setInputName("")
    getCandidateData()
  }

  const handleChange = (e) => {
    setInputName(e.target.value)
  }

  return (
    <form onSubmit={(e) => onRunCandidate(e)}>
      <input className="form-control" value={inputName} type="text" placeholder="Candidate Name" onChange={handleChange} required />
      <button type="submit" className="btn btn-primary form-control">Run Candidate</button>
    </form>
  )
}

const InputDescription = ({ blockchain, getCandidateData }) => {
  const [description, setDescription] = useState("")

  // run a candidate
  const onResetElection = async (e) => {
    e.preventDefault()
    try {
      await blockchain.contract.methods.resetElection(description).send({ from: blockchain.account })
    } catch (error) {
      console.log(error)
    }

    setDescription("")
    getCandidateData()
  }

  const handleChange = (e) => {
    setDescription(e.target.value)
  }

  return (
    <form onSubmit={(e) => onResetElection(e)}>
      <input className="form-control" value={description} type="text" placeholder="Election Description" onChange={handleChange} required />
      <button type="submit" className="btn btn-primary form-control">Reset Election</button>
    </form>
  )
}