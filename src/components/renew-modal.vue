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
import { payment, erc20, paymentAddress, provider } from '@/factories'
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
		const signer = provider.getSigner()
		const from = await signer.getAddress()
		const max = await payment.maxTotalRenewExpiration(from)
		this.maxRenewExp = max.toNumber()
	}

	get formatMaxRenew() {
		return Math.floor(this.maxRenewExp / 3600 / 24) + ' days'
	}

	async approve() {
		try {
			const erc = erc20(this.selectedToken.address)
			const data = erc.interface.encodeFunctionData('approve', [
				paymentAddress,
				uint256Max,
			])
			const signer = provider.getSigner()
			const from = await signer.getAddress()
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
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const data = payment.interface.encodeFunctionData('renew', [
				from,
				this.selectedToken.index,
				this.selectedExpiration.value,
			])
			const tx = await signer.sendTransaction({
				from,
				to: paymentAddress,
				data,
			})
			await tx.wait()
		} catch (e) {
			this.popError(e)
		}
	}

	async checkApprove() {
		if (this.selectedToken) {
			const signer = provider.getSigner()
			const from = await signer.getAddress()
			const erc = erc20(this.selectedToken.address)
			const allowance = await erc.allowance(from, paymentAddress)
			const minAllowance = uint256Max.shr(1)
			this.shouldApprove = allowance.lt(minAllowance)
		}
	}

	async handleExpirationChange(exp: Entity.Expiration) {
		this.selectedExpiration = exp
		const signer = provider.getSigner()
		const from = await signer.getAddress()
		const receipts = await payment.receipts(from)
		const combo = await payment.combos(receipts.level)
		if (combo.isValid) {
			this.cost = await payment.getComboCost(
				receipts.level,
				this.selectedExpiration.value
			)
		}
	}

	@Emit()
	close() {}
}
</script>
