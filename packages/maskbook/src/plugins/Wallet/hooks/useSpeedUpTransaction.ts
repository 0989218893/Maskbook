import {
    TransactionState,
    TransactionStateType,
    useChainId,
    useChainConstants,
    useWeb3,
    isSameAddress,
} from '@masknet/web3-shared'
import type { Transaction } from 'web3-core'
import { useAsync } from 'react-use'
import { useState, useEffect } from 'react'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { Interface, Fragment, JsonFragment } from '@ethersproject/abi'
import type { Options } from 'web3-eth-contract'
import urlcat from 'urlcat'
import { WalletRPC } from '../../../plugins/Wallet/messages'

export function useSpeedUpTransaction(
    state: TransactionState,
    from: string,
    contractData: Options | undefined,
    contractFunctionName: string,
    checkSpeedUpTx: (decodedInputParam: any) => boolean,
    originalTxBlockNumber: number,
) {
    const web3 = useWeb3()
    const chainId = useChainId()

    const [speedUpTx, setSpeedUpTx] = useState<Transaction | null>(null)
    const { EXPLORER_API, EXPLORER_API_KEY, TIME_INTERVAL_TO_QUERY_API } = useChainConstants()
    const [openTimer, setOpenTimer] = useState<NodeJS.Timer | null>(null)
    const interFace = contractData
        ? new Interface(contractData.jsonInterface as readonly (string | Fragment | JsonFragment)[])
        : null

    useEffect(() => {
        if (speedUpTx && openTimer) clearInterval(openTimer as NodeJS.Timer)
    }, [speedUpTx, openTimer])

    useAsync(async () => {
        if (
            (state.type !== TransactionStateType.HASH && state.type !== TransactionStateType.WAIT_FOR_CONFIRMING) ||
            !state.hash ||
            !contractData ||
            !interFace ||
            !EXPLORER_API ||
            !TIME_INTERVAL_TO_QUERY_API ||
            openTimer
        ) {
            return
        }

        setOpenTimer(
            setInterval(async () => {
                const latestBlockNumber = await web3.eth.getBlockNumber()
                const response = await fetch(
                    urlcat(EXPLORER_API, {
                        apikey: EXPLORER_API_KEY,
                        action: 'txlist',
                        module: 'account',
                        sort: 'desc',
                        startBlock: originalTxBlockNumber,
                        endBlock: latestBlockNumber,
                        address: contractData.address,
                    }),
                )

                if (!response.ok) return

                const { result }: { result: Transaction[] } = await response.json()

                if (!result.length) return

                const _speedUpTx =
                    result.find((tx: Transaction) => {
                        if (!isSameAddress(tx.to ?? '', contractData.address) || !isSameAddress(tx.from, from)) {
                            return false
                        }
                        try {
                            const decodedInputParam = interFace.decodeFunctionData(contractFunctionName, tx.input)
                            return checkSpeedUpTx(decodedInputParam)
                        } catch {
                            return false
                        }
                    }) ?? null

                if (_speedUpTx) {
                    setSpeedUpTx(_speedUpTx)
                    // Update recent transactions list
                    const originalTx = await WalletRPC.getRecentTransaction(from, state.hash ?? '')
                    await WalletRPC.removeRecentTransaction(from, state.hash ?? '')
                    await WalletRPC.addRecentTransaction(
                        _speedUpTx.from,
                        _speedUpTx.hash,
                        originalTx?.payload ?? ({} as JsonRpcPayload),
                    )
                }
            }, TIME_INTERVAL_TO_QUERY_API),
        )

        return
    }, [state, from, openTimer, contractData, chainId, originalTxBlockNumber, web3])

    return speedUpTx
}
