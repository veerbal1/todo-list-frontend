export const todoListAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "addTask",
    inputs: [{ name: "_description", type: "string", internalType: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "editTask",
    inputs: [
      { name: "_taskId", type: "uint256", internalType: "uint256" },
      {
        name: "_newDescription",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTask",
    inputs: [{ name: "_taskId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct TodoList.Task",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          {
            name: "description",
            type: "string",
            internalType: "string",
          },
          { name: "isCompleted", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "markTaskCompleted",
    inputs: [{ name: "_taskId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nextTaskId",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tasks",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "description", type: "string", internalType: "string" },
      { name: "isCompleted", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
] as const;
