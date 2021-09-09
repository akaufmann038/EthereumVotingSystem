var VotingSystem = artifacts.require("./VotingSystem.sol");

module.exports = function(deployer) {
  deployer.deploy(VotingSystem);
};
