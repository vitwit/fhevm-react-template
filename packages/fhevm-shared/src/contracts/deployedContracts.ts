/**
 * Auto-generated file.
 * Contains deployed contracts with address and ABI.
 */
export const deployedContracts = {
  "11155111": {
    FHECounter: {
      address: "0x2F39E2bfb4d5c8d6e5503F5103C5411Ae583A032",
      abi: [
        {
          inputs: [
            {
              internalType: "externalEuint32",
              name: "inputEuint32",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "inputProof",
              type: "bytes",
            },
          ],
          name: "decrement",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getCount",
          outputs: [
            {
              internalType: "euint32",
              name: "",
              type: "bytes32",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "externalEuint32",
              name: "inputEuint32",
              type: "bytes32",
            },
            {
              internalType: "bytes",
              name: "inputProof",
              type: "bytes",
            },
          ],
          name: "increment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "protocolId",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "pure",
          type: "function",
        },
      ],
    },
  },
} as const;
