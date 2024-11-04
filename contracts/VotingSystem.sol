// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint candidateId;
    }

    struct Candidate {
        string name;
        uint voteCount;
    }

    address public admin;
    bool public electionStarted;
    bool public electionEnded;
    uint public electionEndTime;

    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    event ElectionStarted(uint endTime);
    event ElectionEnded();
    event VoteCasted(address indexed voter, uint candidateId);
    event NewCandidateAdded(string candidateName, uint candidateId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionOngoing() {
        require(electionStarted, "Election has not started yet");
        require(!electionEnded, "Election has already ended");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionStarted = false;
        electionEnded = false;
    }

    // Function to add a new candidate (Admin only)
    function addCandidate(string memory _name) public onlyAdmin {
        require(bytes(_name).length > 0, "Candidate name cannot be empty.");
        candidates.push(Candidate(_name, 0));
        emit NewCandidateAdded(_name, candidates.length - 1);
    }

    // Function to start the election (Admin only)
    function startElection(uint _durationInMinutes) public onlyAdmin {
        require(!electionStarted, "Election already started");
        electionStarted = true;
        electionEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        emit ElectionStarted(electionEndTime);
    }

    // Function to cast a vote
    function castVote(uint _candidateId) public electionOngoing {
        require(
            voters[msg.sender].isRegistered,
            "You are not registered to vote"
        );
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].candidateId = _candidateId;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(msg.sender, _candidateId);
    }

    // Function to end the election (Admin only)
    function endElection() public onlyAdmin electionOngoing {
        require(
            block.timestamp >= electionEndTime,
            "Election time has not yet passed"
        );
        electionEnded = true;
        electionStarted = false;
        emit ElectionEnded();
    }

    // Function to get the results after election ends
    function getResults() public view returns (Candidate[] memory) {
        require(electionEnded, "Election is not ended yet");
        return candidates;
    }

    // Function to register a voter
    function registerVoter() public {
        require(!electionStarted, "Cannot register during an ongoing election");
        require(
            !voters[msg.sender].isRegistered,
            "Voter is already registered"
        );

        voters[msg.sender] = Voter(true, false, 0);
    }

    // Function to get details of a single candidate by ID
    function getCandidateDetails(
        uint _candidateId
    ) public view returns (Candidate memory) {
        require(_candidateId < candidates.length, "Invalid candidate");
        return candidates[_candidateId];
    }

    // Function to get all candidate details for voters to view
    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}
