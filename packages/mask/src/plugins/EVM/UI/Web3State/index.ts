import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    Web3ProviderType,
} from '@masknet/web3-shared-evm'
import { getFungibleAssetsFn, getNonFungibleTokenFn } from './getAssetsFn'

export const Web3State: Web3Plugin.ObjectCapabilities.Capabilities = {}

export function fixWeb3State(state?: Web3Plugin.ObjectCapabilities.Capabilities, context?: Web3ProviderType) {
    if (!state || !context) return

    state.Shared = state.Shared ?? {
        allowTestnet: context.allowTestnet,
        chainId: context.chainId,
        account: context.account,
        balance: context.balance,
        blockNumber: context.blockNumber,
        networkType: context.networkType,
        providerType: context.providerType,
        walletPrimary: context.walletPrimary,
        wallets: context.wallets,
    }
    state.Asset = state.Asset ?? {
        getFungibleAssets: getFungibleAssetsFn(context),
        getNonFungibleAssets: getNonFungibleTokenFn(context),
    }
    state.Utils = state.Utils ?? {
        getChainDetailed,
        isChainIdValid,

        formatAddress: formatEthereumAddress,
        formatCurrency,
        formatBalance,

        resolveChainName,
        resolveChainFullName,
        resolveChainColor,

        resolveTransactionLink: resolveTransactionLinkOnExplorer,
        resolveAddressLink: resolveAddressLinkOnExplorer,
        resolveBlockLink: resolveBlockLinkOnExplorer,
        resolveCollectibleLink: (chainId: number, address: string, tokenId: string) =>
            resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
                contractDetailed: { address: address },
                tokenId: tokenId,
            } as unknown as any),
    }
    return state
}
