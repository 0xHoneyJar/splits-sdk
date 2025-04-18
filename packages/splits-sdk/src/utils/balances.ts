import { zeroAddress, Address, MulticallReturnType, getAddress } from 'viem'

import {
  CHAIN_INFO,
  getSplitMainAddress,
  NATIVE_TOKEN_ADDRESS,
  ZERO,
} from '../constants'
import { erc20Abi } from '../constants/abi/erc20'
import { splitV2ABI } from '../constants/abi/splitV2'
import { FormattedTokenBalances, Token, SplitsPublicClient } from '../types'
import { fromBigIntToTokenValue, isAlchemyPublicClient } from '.'
import { retryExponentialBackoff } from './requests'
import { IBalance } from '../subgraph/types'
import { mergeWith } from 'lodash'
import { splitMainPolygonAbi } from '../constants/abi'

export const fetchERC20TransferredTokens = async (
  chainId: number,
  publicClient: SplitsPublicClient,
  splitAddress: Address,
): Promise<string[]> => {
  const tokens = new Set<string>([])

  const transferLogs = await publicClient.getLogs({
    event: {
      name: 'Transfer',
      inputs: [
        { type: 'address', indexed: true, name: 'from' },
        { type: 'address', indexed: true, name: 'to' },
        { type: 'uint256', indexed: false, name: 'value' },
      ],
      type: 'event',
    },
    args: {
      to: splitAddress,
    },
    fromBlock: BigInt(CHAIN_INFO[chainId].startBlock),
    toBlock: 'latest',
  })

  transferLogs.map((log) => {
    const erc20Address = log.address
    tokens.add(erc20Address)
  })

  return Array.from(tokens)
}

// NOTE: this should never be called for a user, we only care about a user's
// balance in split main which is stored in subgraph
export const fetchActiveBalances: (
  arg0: number,
  arg1: Address,
  arg2: SplitsPublicClient,
  arg3: Address[],
) => Promise<FormattedTokenBalances> = async (
  chainId,
  accountAddress,
  publicClient,
  fullTokenList,
) => {
  const balances: FormattedTokenBalances = {}

  const erc20Tokens = fullTokenList.filter((token) => token !== zeroAddress)
  const contractCalls = getTokenBalanceCalls(accountAddress, fullTokenList)

  const [tokenData, multicallResponse] = await Promise.all([
    fetchTokenData(erc20Tokens, publicClient),
    publicClient.multicall({
      contracts: contractCalls,
    }),
  ])
  processBalanceMulticallResponse(
    chainId,
    fullTokenList,
    tokenData,
    multicallResponse,
    balances,
  )

  return balances
}

type SplitType = 'splitV1' | 'splitV2'

export const fetchSplitActiveBalances = async ({
  type,
  chainId,
  splitAddress,
  publicClient,
  fullTokenList,
}: {
  type: SplitType
  chainId: number
  splitAddress: Address
  publicClient: SplitsPublicClient
  fullTokenList: Address[]
}) => {
  const balances: FormattedTokenBalances = {}

  const formattedTokenList = fullTokenList.map((token) => getAddress(token))
  const erc20Tokens = formattedTokenList.filter(
    (token) => token !== zeroAddress,
  )
  const contractCalls = getSplitTokenBalanceCalls({
    type,
    chainId,
    splitAddress,
    tokenList: formattedTokenList,
  })

  const [tokenData, multicallResponse] = await Promise.all([
    fetchTokenData(erc20Tokens, publicClient),
    publicClient.multicall({
      contracts: contractCalls,
    }),
  ])
  processSplitBalanceMulticallResponse({
    type,
    chainId,
    fullTokenList: formattedTokenList,
    tokenData,
    multicallResponse,
    balances,
  })

  return balances
}

// NOTE: this should never be called for a user, we only care about a user's
// balance in split main which is stored in subgraph
export const fetchContractBalancesWithAlchemy: (
  arg0: number,
  arg1: Address,
  arg2: SplitsPublicClient,
) => Promise<FormattedTokenBalances> = async (
  chainId,
  address,
  rpcPublicClient,
) => {
  if (!isAlchemyPublicClient(rpcPublicClient))
    throw new Error('Cannot call this without an alchemy provider')

  const balances: FormattedTokenBalances = {}
  const getBalanceFunc = rpcPublicClient.getBalance.bind(rpcPublicClient)
  const sendFunc = rpcPublicClient.request.bind(rpcPublicClient)

  let pageKey = ''
  // eslint-disable-next-line no-loops/no-loops
  do {
    const promisesArray = [
      retryExponentialBackoff(
        sendFunc,
        [
          {
            method: 'alchemy_getTokenBalances',
            params: [
              address,
              'erc20',
              { pageKey: pageKey ? pageKey : undefined },
            ],
          },
        ] as never,
        3,
      ),
    ]
    // Only need to fetch native token on the first loop
    if (!pageKey) {
      promisesArray.push(
        retryExponentialBackoff(getBalanceFunc, [{ address }], 3),
      )
    }

    const results = await Promise.all(promisesArray)
    if (!pageKey) {
      const ethBalance = results[1] as bigint
      const symbol = CHAIN_INFO[chainId]?.nativeCurrency.symbol ?? 'ETH'
      const decimals = 18
      const formattedAmount = fromBigIntToTokenValue(ethBalance, decimals)

      balances[zeroAddress] = {
        rawAmount: ethBalance,
        formattedAmount,
        symbol,
        decimals,
      }
    }

    const erc20Balances = results[0] as {
      tokenBalances: { contractAddress: string; tokenBalance: string }[]
      pageKey: string
    }

    const erc20TokensToFetch = erc20Balances.tokenBalances.map(
      (balanceData) => balanceData.contractAddress as Address,
    )
    const erc20TokenData = await fetchTokenData(
      erc20TokensToFetch,
      rpcPublicClient,
    )

    erc20Balances.tokenBalances.map(
      (balanceData: { contractAddress: string; tokenBalance: string }) => {
        // Failed to fetch token data, not a valid erc20
        if (!erc20TokenData[balanceData.contractAddress]) return

        const formattedAddress = getAddress(balanceData.contractAddress)

        const rawAmount = BigInt(balanceData.tokenBalance)
        const symbol =
          erc20TokenData[balanceData.contractAddress].symbol ?? 'UNKNOWN'
        const decimals =
          erc20TokenData[balanceData.contractAddress].decimals ?? 18
        const formattedAmount = fromBigIntToTokenValue(rawAmount, decimals)

        balances[formattedAddress] = {
          rawAmount,
          formattedAmount,
          symbol,
          decimals,
        }
      },
    )
    pageKey = erc20Balances.pageKey
  } while (pageKey)

  return balances
}

type TokenData = { [address: string]: Token }
const fetchTokenData: (
  arg0: Address[],
  arg1: SplitsPublicClient,
) => Promise<TokenData> = async (tokens, publicClient) => {
  const filteredTokens = tokens.filter((token) => token !== zeroAddress)
  const contractCalls = getTokenDataCalls(filteredTokens)

  const multicallResponse = await publicClient.multicall({
    contracts: contractCalls,
  })

  const tokenData: TokenData = {}
  filteredTokens.map((token, index) => {
    const symbol = multicallResponse[index * 2].result as string
    const decimals = multicallResponse[index * 2 + 1].result as number

    if (symbol !== undefined && decimals !== undefined) {
      tokenData[token] = {
        address: token,
        symbol,
        decimals,
      }
    }
  })

  return tokenData
}

const processBalanceMulticallResponse: (
  arg0: number,
  arg1: Address[],
  arg2: TokenData,
  arg3: MulticallReturnType,
  arg4: FormattedTokenBalances,
) => void = (
  chainId,
  fullTokenList,
  tokenData,
  multicallResponse,
  balances,
) => {
  fullTokenList.map((token, index) => {
    const data = multicallResponse[index]
    const balance = data.result as bigint
    if (balance === undefined) return

    if (token === zeroAddress) {
      const decimals = 18
      const symbol = CHAIN_INFO[chainId]?.nativeCurrency.symbol ?? 'ETH'
      const formattedAmount = fromBigIntToTokenValue(balance, decimals)
      balances[zeroAddress] = {
        rawAmount: balance,
        symbol,
        decimals,
        formattedAmount,
      }
    } else {
      if (!tokenData[token]) return // Unable to fetch token data
      const { symbol, decimals } = tokenData[token]
      if (symbol === undefined || decimals === undefined) return // ignore non erc20
      const formattedAmount = fromBigIntToTokenValue(balance, decimals)
      balances[token] = {
        rawAmount: balance,
        formattedAmount,
        symbol,
        decimals,
      }
    }
  })
}

const processSplitBalanceMulticallResponse = ({
  type,
  chainId,
  fullTokenList,
  tokenData,
  multicallResponse,
  balances,
}: {
  type: SplitType
  chainId: number
  fullTokenList: Address[]
  tokenData: TokenData
  multicallResponse: MulticallReturnType
  balances: FormattedTokenBalances
}) => {
  fullTokenList.map((token, index) => {
    const data = multicallResponse[index]

    let balance: bigint
    if (type === 'splitV1') {
      balance = data.result as bigint
    } else {
      const [splitBalance, warehouseBalance] = data.result as [bigint, bigint]
      if (splitBalance === undefined || warehouseBalance === undefined) return
      balance = splitBalance + warehouseBalance
    }

    let symbol: string
    let decimals: number
    if (token === zeroAddress) {
      decimals = 18
      symbol = CHAIN_INFO[chainId]?.nativeCurrency.symbol ?? 'ETH'
    } else {
      if (!tokenData[token]) return // Unable to fetch token data
      if (
        tokenData[token].symbol === undefined ||
        tokenData[token].decimals === undefined
      )
        return // ignore non erc20
      symbol = tokenData[token].symbol as string
      decimals = tokenData[token].decimals as number
    }

    if (balance > BigInt(2)) {
      // Splits can leave one in the contract and one in the warehouse for gas
      // efficiency. Filter those out.
      const formattedAmount = fromBigIntToTokenValue(balance, decimals)
      balances[token] = {
        rawAmount: balance,
        formattedAmount,
        symbol,
        decimals,
      }
    }
  })
}

const ethBalanceAbi = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'getEthBalance',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const getTokenBalanceCalls = (
  accountAddress: Address,
  tokenList: Address[],
) => {
  return tokenList.map((token) => {
    if (token === zeroAddress)
      return {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11' as Address, // multicall3
        abi: ethBalanceAbi,
        functionName: 'getEthBalance',
        args: [accountAddress],
      }
    return {
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [accountAddress],
    }
  })
}

const getSplitTokenBalanceCalls = ({
  type,
  chainId,
  splitAddress,
  tokenList,
}: {
  type: SplitType
  chainId: number
  splitAddress: Address
  tokenList: Address[]
}) => {
  return tokenList.map((token) => {
    if (type === 'splitV1') {
      if (token === zeroAddress)
        return {
          address: getSplitMainAddress(chainId),
          abi: splitMainPolygonAbi,
          functionName: 'getETHBalance',
          args: [splitAddress],
        }
      return {
        address: getSplitMainAddress(chainId),
        abi: splitMainPolygonAbi,
        functionName: 'getERC20Balance',
        args: [splitAddress, token],
      }
    } else {
      return {
        address: splitAddress,
        abi: splitV2ABI,
        functionName: 'getSplitBalance',
        args: [token === zeroAddress ? NATIVE_TOKEN_ADDRESS : token],
      }
    }
  })
}

const getTokenDataCalls = (tokens: Address[]) => {
  return tokens
    .map((token) => {
      if (token === zeroAddress)
        throw new Error('Cannot fetch data for address zero')

      return [
        {
          address: token,
          abi: erc20Abi,
          functionName: 'symbol',
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: 'decimals',
        },
      ]
    })
    .flat()
}

export const mergeBalances = (balances: IBalance[]): IBalance => {
  return mergeWith(
    {},
    ...balances,
    (
      o: { amount: bigint; symbol: string; decimals: number },
      s: { amount: bigint; symbol: string; decimals: number },
    ) => {
      return {
        symbol: o?.symbol ?? s.symbol,
        decimals: o?.decimals ?? s.decimals,
        amount: (o?.amount ?? ZERO) + (s?.amount ?? ZERO),
      }
    },
  )
}

export const mergeFormattedTokenBalances = (
  balances: FormattedTokenBalances[],
): FormattedTokenBalances => {
  return mergeWith(
    {},
    ...balances,
    (
      o: {
        rawAmount: bigint
        formattedAmount: string
        symbol: string
        decimals: number
      },
      s: {
        rawAmount: bigint
        formattedAmount: string
        symbol: string
        decimals: number
      },
    ) => {
      const decimals = o?.decimals ?? s.decimals
      const rawAmount = (o?.rawAmount ?? ZERO) + (s?.rawAmount ?? ZERO)
      const formattedAmount = fromBigIntToTokenValue(rawAmount, decimals)

      return {
        symbol: o?.symbol ?? s.symbol,
        decimals,
        rawAmount,
        formattedAmount,
      }
    },
  )
}
