// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

// to change: use a list of structs for the candidate to replace all the mappings

contract VotingSystem {
    struct Candidate {
        string name;
        address addr;
        uint256 votes;
    }

    // keep track of which accounts have voted in current election
    mapping(address => bool) private hasVoted;
    // list of voter addresses
    address[] private voters;

    // list of all candidates
    Candidate[] private candidates;

    // represents whether voting has started for current election
    bool public electionStarted;

    // description of the current election
    string public electionDescription;

    // owner of contract, always deploying account
    address private owner;

    // mapping of addresses to bool showing moderator status
    mapping(address => bool) private moderators;

    constructor() public {
        // set owner to the account which deployed the contract
        owner = msg.sender;

        // owner is automatically a moderator
        moderators[msg.sender] = true;

        // set placeholder for election description
        electionDescription = "Description placeholder";
    }

    // sets the description of the election
    function setElectionDescription(string memory description) public {
        require(
            moderators[msg.sender] == true,
            "Only a moderator can set the election description!"
        );

        electionDescription = description;
    }

    // resets the election
    function resetElection(string memory newDescription) public {
        require(
            moderators[msg.sender] == true,
            "Only a moderator can reset an election!"
        );

        // reset all voters
        for (uint256 i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false;
        }

        delete candidates;
        delete voters;
        electionDescription = newDescription;

        electionStarted = false;
    }

    // returns true if function caller is a moderator and false if not
    function isModerator() public view returns (bool) {
        return moderators[msg.sender];
    }

    // approve a new given moderator
    function approveModerator(address newModerator) public {
        // function can only be called by owner
        require(
            msg.sender == owner,
            "Message can only be called by smart contract owner!"
        );

        moderators[newModerator] = true;
    }

    // add candidate to candidates list
    function runCandidate(string memory newCandidateName) public {
        // require that election has not started
        require(electionStarted == false);

        // require that candidate does not already exist
        bool doesExist = false;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].addr == msg.sender) {
                doesExist = true;
            }
        }

        require(doesExist == false, "Candidate address already exists!");

        // add candidate information to contract state
        candidates.push(Candidate(newCandidateName, msg.sender, 0));
    }

    function unRunCandidate() public {
        candidates.pop();
    }

    function getCandidates() public view returns (address[] memory) {
        address[] memory candidateAddresses = new address[](candidates.length);

        for (uint i = 0; i < candidates.length; i++) {
            candidateAddresses[i] = candidates[i].addr;
        }

        return candidateAddresses;
    }

    // returns candidate name given candidate address
    function getCandidateName(address candidateAddress)
        public
        view
        returns (string memory)
    {
        // verify that candidate exists
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].addr == candidateAddress) {
                return candidates[i].name;
            }
        }

        revert("Candidate does not exist!");
    }

    // returns the number of votes of a given candidate
    function getCandidateVotes(address candidateAddress)
        public
        view
        returns (uint256)
    {
        // verify that candidate exists
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].addr == candidateAddress) {
                return candidates[i].votes;
            }
        }

        revert("Candidate does not exist!");
    }

    // vote for a candidate
    function vote(address candidateAddress) public {
        // verify that voting has started
        require(electionStarted == true, "Voting has not started!");

        // verify that voter has not already voted
        require(hasVoted[msg.sender] == false, "Client has already voted!");

        // verify that candidate exists
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].addr == candidateAddress) {
                // incrementing candidate votes
                Candidate storage currentCandidate = candidates[i];
                currentCandidate.votes += 1;

                // record that calling account has voted
                hasVoted[msg.sender] = true;
                voters.push(msg.sender);
            }
        }

        revert("Candidate does not exist!");
    }

    // start voting
    function beginElection() public {
        // verify that election has not already started
        require(electionStarted == false, "Election has already started!");

        // verify that caller of function is a moderator
        require(
            moderators[msg.sender] == true,
            "Function caller is not a moderator!"
        );

        require(
            candidates.length >= 2,
            "There must be at least two candidates!"
        );

        electionStarted = true;
    }

    // end voting
    function endElection() public returns (address[] memory) {
        // verify that election has started
        require(electionStarted == true, "Election has started!");

        // verify that caller of function is a moderator
        require(
            moderators[msg.sender] == true,
            "Function caller is not a moderator!"
        );

        // find the indicies of the winners in candidates
        // create a list

        electionStarted = false;

        address[] memory winners = new address[](candidates.length);
        winners[0] = candidates[0].addr;

        uint256 winnersSize = 1;

        uint256 winnerIdx = 0;

        uint256 winningVotes = candidates[0].votes;

        // first find winner
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes > winningVotes) {
                winners[0] = candidates[i].addr;
                winnerIdx = i;
                winningVotes = candidates[i].votes;
            }
        }

        // determine if there is a repeated winner
        for (uint256 i = 0; i < candidates.length; i++) {
            // if the index is not the same as the winning index
            // and the number of votes for the current candidate is the same
            // as the winning number of votes...
            if (i != winnerIdx && candidates[i].votes == winningVotes) {
                winners[winnersSize] = candidates[i].addr;
                winnersSize += 1;
            }
        }

        return winners;
    }
}

// // addresses of all candidates
// address[] private candidates;

// // mapping of candidate id's to bool representing their existence
// mapping(address => bool) private candidatesExist;

// // mapping of addresses to bool showing moderator status
// mapping(address => bool) private moderators;

// // candidate address to name
// mapping(address => string) private candidateNames;

// // candidate address to number of votes
// mapping(address => uint256) private candidateVotes;

// // addresses of people who have voted
// mapping(address => bool) private hasVoted;

// // if false, voting has not begun and new candidates can run
// // if true, voting has begun, people can vote, and new candidates can not run
// bool public electionHasStarted = false;

// // description of the current election
// string electionDescription;

// // owner of contract, always deploying account
// address private owner;
