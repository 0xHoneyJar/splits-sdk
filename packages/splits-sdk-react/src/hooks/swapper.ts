import { useCallback, useContext, useEffect, useState } from 'react'
import type { Event } from '@ethersproject/contracts'
import {
  getTransactionEvents,
  CreateSwapperConfig,
  UniV3FlashSwapConfig,
  SwapperExecCallsConfig,
  SwapperPauseConfig,
  SwapperSetBeneficiaryConfig,
  SwapperSetTokenToBeneficiaryConfig,
  SwapperSetOracleConfig,
  SwapperSetDefaultScaledOfferFactorConfig,
  SwapperSetScaledOfferFactorOverridesConfig,
  Swapper,
} from '@0xsplits/splits-sdk'

import { SplitsContext } from '../context'
import { ContractExecutionStatus, DataLoadStatus, RequestError } from '../types'
import { getSplitsClient } from '../utils'

export const useCreateSwapper = (): {
  createSwapper: (arg0: CreateSwapperConfig) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const createSwapper = useCallback(
    async (argsDict: CreateSwapperConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitCreateSwapperTransaction(argsDict)

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.createSwapper,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { createSwapper, status, txHash, error }
}

export const useUniV3FlashSwap = (): {
  uniV3FlashSwap: (arg0: UniV3FlashSwapConfig) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const uniV3FlashSwap = useCallback(
    async (argsDict: UniV3FlashSwapConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitUniV3FlashSwapTransaction(argsDict)

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.uniV3FlashSwap,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { uniV3FlashSwap, status, txHash, error }
}

export const useSwapperExecCalls = (): {
  execCalls: (arg0: SwapperExecCallsConfig) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const execCalls = useCallback(
    async (argsDict: SwapperExecCallsConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } = await splitsClient.swapper.submitExecCallsTransaction(
          argsDict,
        )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.execCalls,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { execCalls, status, txHash, error }
}

export const useSwapperPause = (): {
  setPaused: (arg0: SwapperPauseConfig) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setPaused = useCallback(
    async (argsDict: SwapperPauseConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } = await splitsClient.swapper.submitSetPausedTransaction(
          argsDict,
        )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setPaused,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setPaused, status, txHash, error }
}

export const useSwapperSetBeneficiary = (): {
  setBeneficiary: (
    arg0: SwapperSetBeneficiaryConfig,
  ) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setBeneficiary = useCallback(
    async (argsDict: SwapperSetBeneficiaryConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitSetBeneficiaryTransaction(argsDict)

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setBeneficiary,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setBeneficiary, status, txHash, error }
}

export const useSwapperSetTokenToBeneficiary = (): {
  setTokenToBeneficiary: (
    arg0: SwapperSetTokenToBeneficiaryConfig,
  ) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setTokenToBeneficiary = useCallback(
    async (argsDict: SwapperSetTokenToBeneficiaryConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitSetTokenToBeneficiaryTransaction(
            argsDict,
          )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setTokenToBeneficiary,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setTokenToBeneficiary, status, txHash, error }
}

export const useSwapperSetOracle = (): {
  setOracle: (arg0: SwapperSetOracleConfig) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setOracle = useCallback(
    async (argsDict: SwapperSetOracleConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } = await splitsClient.swapper.submitSetOracleTransaction(
          argsDict,
        )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setOracle,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setOracle, status, txHash, error }
}

export const useSwapperSetDefaultScaledOfferFactor = (): {
  setDefaultScaledOfferFactor: (
    arg0: SwapperSetDefaultScaledOfferFactorConfig,
  ) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setDefaultScaledOfferFactor = useCallback(
    async (argsDict: SwapperSetDefaultScaledOfferFactorConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitSetDefaultScaledOfferFactorTransaction(
            argsDict,
          )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setDefaultScaledOfferFactor,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setDefaultScaledOfferFactor, status, txHash, error }
}

export const useSwapperSetScaledOfferFactorOverrides = (): {
  setScaledOfferFactorOverrides: (
    arg0: SwapperSetScaledOfferFactorOverridesConfig,
  ) => Promise<Event[] | undefined>
  status?: ContractExecutionStatus
  txHash?: string
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)

  const [status, setStatus] = useState<ContractExecutionStatus>()
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<RequestError>()

  const setScaledOfferFactorOverrides = useCallback(
    async (argsDict: SwapperSetScaledOfferFactorOverridesConfig) => {
      if (!splitsClient.swapper) throw new Error('Invalid chain id for swapper')

      try {
        setStatus('pendingApproval')
        setError(undefined)
        setTxHash(undefined)

        const { tx } =
          await splitsClient.swapper.submitSetScaledOfferFactorOverridesTransaction(
            argsDict,
          )

        setStatus('txInProgress')
        setTxHash(tx.hash)

        const events = await getTransactionEvents(
          tx,
          splitsClient.swapper.eventTopics.setScaledOfferFactorOverrides,
        )

        setStatus('complete')

        return events
      } catch (e) {
        setStatus('error')
        setError(e)
      }
    },
    [splitsClient],
  )

  return { setScaledOfferFactorOverrides, status, txHash, error }
}

export const useSwapperMetadata = (
  swapperId: string,
): {
  isLoading: boolean
  swapperMetadata: Swapper | undefined
  status?: DataLoadStatus
  error?: RequestError
} => {
  const context = useContext(SplitsContext)
  const splitsClient = getSplitsClient(context)
  const swapperClient = splitsClient.swapper
  if (!swapperClient) {
    throw new Error('Invalid chain id for swapper')
  }

  const [swapperMetadata, setSwapperMetadata] = useState<Swapper | undefined>()
  const [isLoading, setIsLoading] = useState(!!swapperId)
  const [status, setStatus] = useState<DataLoadStatus | undefined>(
    swapperId ? 'loading' : undefined,
  )
  const [error, setError] = useState<RequestError>()

  useEffect(() => {
    let isActive = true

    const fetchMetadata = async () => {
      try {
        const swapper = await swapperClient.getSwapperMetadata({ swapperId })
        if (!isActive) return
        setSwapperMetadata(swapper)
        setStatus('success')
      } catch (e) {
        if (isActive) {
          setStatus('error')
          setError(e)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    setError(undefined)
    if (swapperId) {
      setIsLoading(true)
      setStatus('loading')
      fetchMetadata()
    } else {
      setStatus(undefined)
      setIsLoading(false)
      setSwapperMetadata(undefined)
    }

    return () => {
      isActive = false
    }
  }, [splitsClient, swapperId])

  return {
    isLoading,
    swapperMetadata,
    status,
    error,
  }
}
