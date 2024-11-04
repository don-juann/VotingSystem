let web3;
let contract;
let account;

const contractAddress = "0x85A5E7f02C61C68Ad3aEce925C86160933e464bB";
const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
    ],
    name: "addCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256",
      },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [],
    name: "ElectionEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "ElectionStarted",
    type: "event",
  },
  {
    inputs: [],
    name: "endElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "candidateName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateId",
        type: "uint256",
      },
    ],
    name: "NewCandidateAdded",
    type: "event",
  },
  {
    inputs: [],
    name: "registerVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_durationInMinutes",
        type: "uint256",
      },
    ],
    name: "startElection",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "candidateId",
        type: "uint256",
      },
    ],
    name: "VoteCasted",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "candidates",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "voteCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "electionEnded",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "electionEndTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "electionStarted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCandidates",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct VotingSystem.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_candidateId",
        type: "uint256",
      },
    ],
    name: "getCandidateDetails",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct VotingSystem.Candidate",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getResults",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          },
        ],
        internalType: "struct VotingSystem.Candidate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "voters",
    outputs: [
      {
        internalType: "bool",
        name: "isRegistered",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "hasVoted",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "candidateId",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

window.onload = async () => {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum); // Initialize Web3 with MetaMask
    await connectWallet(); // Prompt user to connect wallet
  } else {
    alert("Please install MetaMask to use this DApp!");
  }

  contract = new web3.eth.Contract(abi, contractAddress); // Initialize contract
};

// Connect MetaMask Wallet
async function connectWallet() {
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  account = accounts[0];
  document.getElementById("account").innerText = account;
}

// Add a new candidate (Admin only)
async function addCandidate() {
  const name = document.getElementById("candidateName").value;
  if (!name) {
    alert("Please enter a candidate name");
    return;
  }

  try {
    await contract.methods.addCandidate(name).send({ from: account });
    alert(`Candidate ${name} added successfully!`);
    displayCandidates(); // Call displayCandidates after adding a candidate
  } catch (error) {
    console.error(error);
    alert("Error adding candidate. Ensure you are the admin.");
  }
}

async function showCandidates() {
  console.log("showCandidates function called");
  try {
    const candidates = await contract.methods.getAllCandidates().call();
    let candidatesList = document.getElementById("candidates-list");
    candidatesList.innerHTML = "";

    candidates.forEach((candidate, index) => {
      const candidateEntry = document.createElement("div");
      candidateEntry.innerHTML = `ID: ${index} | Name: ${candidate.name} | Votes: ${candidate.voteCount}`;
      candidatesList.appendChild(candidateEntry);
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
}

// Start the election (Admin only)
async function startElection() {
  const duration = prompt("Enter election duration (in minutes):");
  if (!duration) return;

  try {
    await contract.methods.startElection(duration).send({ from: account });
    alert(`Election started for ${duration} minutes!`);
  } catch (error) {
    console.error(error);
    alert("Error starting the election.");
  }
}

// End the election (Admin only)
async function endElection() {
  try {
    await contract.methods.endElection().send({ from: account });
    alert("Election ended successfully!");
  } catch (error) {
    console.error(error);
    alert("Error ending the election.");
  }
}

// Register the voter
async function registerVoter() {
  try {
    await contract.methods.registerVoter().send({ from: account });
    alert("You are now registered as a voter!");
  } catch (error) {
    console.error(error);
    alert("Error registering as a voter.");
  }
}

// Cast a vote (requires payment)
async function castVote() {
  const candidateId = document.getElementById("voteCandidateId").value;
  if (!candidateId) {
    alert("Please enter a valid candidate ID");
    return;
  }

  try {
    await contract.methods.castVote(candidateId).send({
      from: account,
      value: web3.utils.toWei("0.01", "ether"), // Payment of 0.01 ETH
    });
    alert("Vote casted successfully!");
  } catch (error) {
    console.error(error);
    alert(
      "Error casting vote. Ensure you are registered and the election is ongoing."
    );
  }
}

// Get election results
async function getResults() {
  try {
    const results = await contract.methods.getResults().call();
    let output = "";

    results.forEach((candidate, index) => {
      output += `Candidate ${index}: ${candidate.name} - ${candidate.voteCount} votes\n`;
    });

    document.getElementById("resultsOutput").innerText = output;
  } catch (error) {
    console.error(error);
    alert("Error fetching election results.");
  }
}
