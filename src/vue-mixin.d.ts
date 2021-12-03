import VueRouter from 'vue-router'
import { Signer, providers } from 'ethers'
import { HostingPayment } from '@/factories/HostingPayment'
import { MultiSigWallet } from '@/factories/MultiSigWallet'

import { ERC20 } from '@/factories/ERC20'

declare module 'vue/types/vue' {
	export interface Vue {
		beforeCreate(): void
		created(): void
		beforeMount(): void
		mounted(): void
		beforeUpdate(): void
		updated(): void
		activated(): void
		deactivated(): void
		beforeDestroy(): void
		destroyed(): void
		$router: VueRouter

		paymentAddress: string
		multSigWalletAddress: string

		provider(): providers.Provider
		async signer(): Promise<Signer>
		async network(): Promise<providers.Network>
		async account(): Promise<string>
		multSigWallet(): MultiSigWallet
		payment(): HostingPayment
		erc20(address: string): ERC20

		popError(e: any)
		getBalance(options?: CallOption): Promise<any>
		getAccount(): Promise<string>
	}

}