import { Vue, Component } from 'vue-property-decorator'
import { isNetworkSupported } from '@/utils'
import { providers } from 'ethers'
import { HostingPayment__factory } from '@/factories/HostingPayment__factory'
import { MultiSigWallet__factory } from '@/factories/MultiSigWallet__factory'

import { ERC20__factory } from '@/factories/ERC20__factory'
import { ERC20 } from '@/factories/ERC20'

@Component
export default class ETHMixin extends Vue {
	public paymentAddress = '0xf680d03639389c2510C03e38fc6bF768f7F66047'

	public multSigWalletAddress = '0x2AfA39b1b1143d81f64F7A982649B376B05121F6'

	public async getBalance(options?: CallOption) {
		try {
			const account = await this.getAccount()
			return window.ethereum.request({
				method: 'eth_getBalance',
				params: [
					options?.from || account,
				]
			})
		} catch (e) {
			this.popError(e)
		}
	}

	public async getAccount(): Promise<string> {
		if (!window.ethereum) {
			throw 'Please install MetaMask to use this app.'
		}

		if (!isNetworkSupported(parseInt(window.ethereum.chainId))) {
			throw 'Network not supported.'
		}

		if (!this.$store.state.account || !this.$store.state.chainId) {
			throw 'Wallet not connected'
		}

		return this.$store.state.account
	}

	public popError(e: any) {
		if (typeof e === 'string') {
			return this.$message.error(e, 3)
		} else if (e.message) {
			return this.$message.error(e.message, 3)
		} else {
			return this.$message.error(JSON.stringify(e), 3)
		}
	}


	public provider() {
		if (!window.ethereum) {
			throw 'please install metamask first.'
		}
		const p = new providers.Web3Provider(window.ethereum as any)
		return p
	}

	public async signer() {
		if (!isNetworkSupported((await this.network()).chainId)) {
			throw 'Network not supported.'
		}
		const accounts = await window.ethereum.request({
			method: 'eth_requestAccounts'
		})
		if (accounts.length == 0) {
			throw 'account not available, please connect to metamask.'
		}
		return this.provider().getSigner()
	}

	public async network() {
		return this.provider().getNetwork()
	}

	public async account() {
		const s = await this.signer()
		return s.getAddress()
	}

	public payment() {
		return HostingPayment__factory.connect(
			this.paymentAddress,
			this.provider()
		)
	}

	public multSigWallet() {
		return MultiSigWallet__factory.connect(
			this.multSigWalletAddress,
			this.provider()
		)
	}

	public erc20(address: string): ERC20 {
		return ERC20__factory.connect(address, this.provider())
	}

}
