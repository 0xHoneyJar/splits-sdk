/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SplitWallet, SplitWalletInterface } from "../SplitWallet";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Unauthorized",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "split",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ReceiveETH",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract ERC20",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "sendERC20ToMain",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "sendETHToMain",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "splitMain",
    outputs: [
      {
        internalType: "contract ISplitMain",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b5033606081901b60805261035461004c60003960008181604b0152818160bc015281816101080152818161013c015261018601526103546000f3fe6080604052600436106100345760003560e01c80630e769b2b146100395780637c1f3ffe14610089578063ab0ebff41461009e575b600080fd5b34801561004557600080fd5b5061006d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200160405180910390f35b61009c6100973660046102d0565b6100b1565b005b61009c6100ac366004610306565b610131565b336001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146100f9576040516282b42960e81b815260040160405180910390fd5b61012d6001600160a01b0383167f0000000000000000000000000000000000000000000000000000000000000000836101af565b5050565b336001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614610179576040516282b42960e81b815260040160405180910390fd5b6101ac6001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001682610233565b50565b600060405163a9059cbb60e01b81526001600160a01b03841660048201528260248201526000806044836000895af19150506101ea81610289565b61022d5760405162461bcd60e51b815260206004820152600f60248201526e1514905394d1915497d19052531151608a1b60448201526064015b60405180910390fd5b50505050565b600080600080600085875af19050806102845760405162461bcd60e51b815260206004820152601360248201527211551217d514905394d1915497d19052531151606a1b6044820152606401610224565b505050565b60003d8261029b57806000803e806000fd5b80602081146102b35780156102c457600092506102c9565b816000803e600051151592506102c9565b600192505b5050919050565b600080604083850312156102e2578182fd5b82356001600160a01b03811681146102f8578283fd5b946020939093013593505050565b600060208284031215610317578081fd5b503591905056fea26469706673582212208e095a368bcb2efb2a8afd9b560ad94441e926086a4bc92edf16c33900df798e64736f6c63430008040033";

export class SplitWallet__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SplitWallet> {
    return super.deploy(overrides || {}) as Promise<SplitWallet>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SplitWallet {
    return super.attach(address) as SplitWallet;
  }
  connect(signer: Signer): SplitWallet__factory {
    return super.connect(signer) as SplitWallet__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SplitWalletInterface {
    return new utils.Interface(_abi) as SplitWalletInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SplitWallet {
    return new Contract(address, _abi, signerOrProvider) as SplitWallet;
  }
}
