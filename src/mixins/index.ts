import { Vue, Component } from 'vue-property-decorator'
import { utils } from 'ethers'
import { isNetworkSupported } from '@/utils'

@Component
export default class ETHMixin extends Vue {

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

	private checkFunction(contractInterface: utils.Interface, functionName: string) {
		return contractInterface.getFunction(functionName)
	}
}
