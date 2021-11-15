<template>
	<div id="app">
		<div style="width: 350px">
			<a-card>
				<a-button
					v-if="!isConnected"
					type="primary"
					@click="connect"
				>
					Connect
				</a-button>
				<div v-else>
					Connected: {{ formatAccount }} Network: {{ network }}
					<a-icon
						v-if="isNetworkSupported"
						style="color: green"
						type="check-circle"
						theme="filled"
					/>
					<a-icon
						v-else
						style="color: red"
						type="warning"
						theme="filled"
					/>
				</div>
			</a-card>
			<a-menu
				:default-selected-keys="['1']"
				:default-open-keys="['sub1']"
				mode="inline"
			>
				<a-menu-item key="1">
					<span>Home</span>
					<router-link to="/" />
				</a-menu-item>
			</a-menu>
		</div>
		<keep-alive>
			<router-view style="margin-left: 8px" />
		</keep-alive>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import {
	UPDATE_ACCOUNT,
	UPDATE_CHAINID,
	UPDATE_COMBOS,
	UPDATE_EXPIRATIONS,
	UPDATE_TOKENS,
} from '@/store'
import { formatNetwork, isNetworkSupported } from '@/utils'
import { payment, erc20, provider } from '@/factories'
@Component
export default class App extends Vue {
	async created() {
		this.initExpirations()
		this.checkState()
		this.listen()
	}

	get isNetworkSupported() {
		return isNetworkSupported(this.$store.state.chainId)
	}

	get isConnected() {
		if (!window.ethereum) {
			return false
		}
		return !!this.$store.state.account
	}

	get network() {
		return formatNetwork(this.$store.state.chainId)
	}

	async checkState() {
		if (window.ethereum) {
			this.initExpirations()
			await this.initTokens()
			await this.initCombos()
			const signer = provider.getSigner()
			const account = await signer.getAddress()
			const chainId = await signer.getChainId()
			this.$store.commit(UPDATE_ACCOUNT, account)
			this.$store.commit(UPDATE_CHAINID, chainId)
		}
	}

	async initTokens() {
		const totalTokens = await payment.tokenLength()
		let l = totalTokens.toNumber()
		const tokens = []
		for (let i = 0; i < l; i++) {
			let address = await payment.tokens(i)
			const erc = erc20(address)
			const name = await erc.name()
			const symbol = await erc.symbol()
			tokens.push({
				index: i,
				name,
				symbol,
				address,
			})
		}
		this.$store.commit(UPDATE_TOKENS, tokens)
	}

	async initCombos() {
		const combos = []
		const totalCombos = await payment.comboLength()
		const l = totalCombos.toNumber()
		for (let i = 0; i < l; i++) {
			const combo = await payment.combos(i)
			combos.push({ level: i, ...combo })
		}
		this.$store.commit(UPDATE_COMBOS, combos)
	}

	async connect() {
		if (!window.ethereum) {
			return this.$message.warn('Please install MetaMask to use this app.')
		}

		const isUnlocked = await window.ethereum._metamask.isUnlocked()
		if (!isUnlocked) {
			return this.$message.warn('Metamask has been locked, please unlock it.')
		}

		if (!isNetworkSupported(parseInt(window.ethereum.chainId))) {
			return this.$message.error(
				'Please MetaMask change your network to `Goerli`.'
			)
		}

		let accounts = await window.ethereum.request({
			method: 'eth_accounts',
		})
		if (accounts.length == 0) {
			accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			})
		}

		await this.checkState()
	}

	initExpirations() {
		const expirations: Entity.Expiration[] = []
		const onemin = 60
		for (let i = 1; i <= 5; i++) {
			expirations.push({ value: onemin * i, title: `${i} mins` })
		}
		const onemonth = 30 * 24 * 3600
		for (let i = 1; i <= 3; i++) {
			expirations.push({ value: onemonth * i, title: `${i} months` })
		}
		expirations.push({ value: onemonth * 6, title: '6 months' })
		this.$store.commit(UPDATE_EXPIRATIONS, expirations)
	}

	listen() {
		window.ethereum.on('accountsChanged', (accounts) => {
			this.$store.commit(UPDATE_ACCOUNT, accounts[0])
			window.location.reload()
		})

		window.ethereum.on('chainChanged', (chainId) => {
			this.$store.commit(UPDATE_CHAINID, chainId)
			if (isNetworkSupported(chainId)) {
				window.location.reload()
			}
		})
	}

	get formatAccount() {
		const account = this.$store.state.account
		if (account.length > 0) {
			return (
				account.substr(0, 10) + '....' + account.substr(account.length - 8, 8)
			)
		}
		return account
	}
}
</script>
<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}
</style>
