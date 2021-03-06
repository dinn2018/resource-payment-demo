<template>
	<div style="width: 100%">
		<a-modal
			v-model="visible"
			:ok-button-props="{ style: { display: 'none' } }"
			:cancel-button-props="{ style: { display: 'none' } }"
			@cancel="close"
		>
			<a-form>
				<a-form-item label="Expirations:">
					<Expirations @onExpirationChanged="handleExpirationChange" />
					<div>Max renew expiration is: {{ formatMaxRenew }}</div>
				</a-form-item>

				<a-form-item label="Tokens:">
					<Tokens @onTokenChanged="handleTokenChange" />
				</a-form-item>
				<a-form-item label="Cost:">
					{{ formatToken(cost) }} U
				</a-form-item>
				<a-form-item>
					<a-button
						v-show="shouldApprove"
						type="primary"
						@click="approve"
					>
						Approve
					</a-button>
					<a-button
						type="primary"
						@click="renew"
					>
						Renew
					</a-button>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import Tokens from '@/components/tokens.vue'
import Expirations from '@/components/expirations.vue'
import { BigNumber } from 'ethers'
import { formatToken, uint256Max } from '@/utils'

@Component({
	components: {
		Tokens,
		Expirations,
	},
	methods: {
		formatToken,
	},
})
export default class RenewModal extends Vue {
	selectedToken: Entity.Token = { index: 0, name: '', symbol: '', address: '' }
	selectedExpiration: Entity.Expiration = { value: 0, title: '' }

	shouldApprove = false

	currentExpirationIndex = 0
	visible = false

	cost: BigNumber = BigNumber.from('0')

	maxRenewExp = 0

	@Watch('show')
	onShow(newValue: boolean) {
		this.visible = newValue
	}

	@Prop()
	show = false

	async handleTokenChange(token: Entity.Token) {
		this.selectedToken = token
		await this.checkApprove()
	}

	async created() {
		const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
		const max = await this.payment().maxTotalRenewExpiration(from)
		this.maxRenewExp = max.toNumber()
	}

	get formatMaxRenew() {
		return Math.floor(this.maxRenewExp / 3600 / 24) + ' days'
	}

	async approve() {
		try {
			const erc = this.erc20(this.selectedToken.address)
			const data = erc.interface.encodeFunctionData('approve', [
				this.paymentAddress,
				uint256Max,
			])
			const signer = await this.signer()
			const from = await this.account()
			const tx = await signer.sendTransaction({
				from,
				to: this.selectedToken.address,
				data,
			})
			await tx.wait()
		} catch (e) {
			this.popError(e)
		}
	}

	async renew() {
		try {
			const signer = await this.signer()
			const from = await signer.getAddress()
			const nonce = await this.payment().nonces(
				'0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
			)
			const data = this.payment().interface.encodeFunctionData('renew', [
				nonce,
				'0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b',
				this.selectedToken.index,
				this.selectedExpiration.value,
			])
			const tx = await signer.sendTransaction({
				from,
				to: this.paymentAddress,
				data,
			})
			await tx.wait()
		} catch (e) {
			this.popError(e)
		}
	}

	async checkApprove() {
		if (this.selectedToken) {
			const signer = await this.signer()
			const from = await signer.getAddress()
			const erc = this.erc20(this.selectedToken.address)
			const allowance = await erc.allowance(from, this.paymentAddress)
			const minAllowance = uint256Max.shr(1)
			this.shouldApprove = allowance.lt(minAllowance)
		}
	}

	async handleExpirationChange(exp: Entity.Expiration) {
		this.selectedExpiration = exp
		const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
		const receipts = await this.payment().receipts(from)
		const combo = await this.payment().combos(receipts.level)
		if (combo.isValid) {
			this.cost = await this.payment().getComboCost(
				receipts.level,
				this.selectedExpiration.value
			)
		}
	}

	@Emit()
	close() {}
}
</script>
