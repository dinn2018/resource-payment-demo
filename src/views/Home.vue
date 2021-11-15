<template>
	<div style="width: 100%">
		<a-form>
			<a-form-item
				v-if="canRenew"
				:label="exp"
			>
				<a-button
					v-if="canRenew"
					type="primary"
					@click="renew"
				>
					Go to renew
				</a-button>
			</a-form-item>
			<a-form-item label="Combos">
				<Combos @onComboChanged="handleComboChange" />
			</a-form-item>
			<a-button
				class="m-l-min"
				type="primary"
				@click="pay"
			>
				Go to pay
			</a-button>
		</a-form>
		<PaymentModal
			:show="showPayment"
			:combo="selectedCombo"
			@close="onPaymentModalClose"
		/>
		<RenewModal
			:show="showRenew"
			@close="onRenewModalClose"
		/>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BigNumber } from 'ethers'
import { payment, provider } from '@/factories'

import Combos from '@/components/combos.vue'
import PaymentModal from '@/components/payment-modal.vue'
import RenewModal from '@/components/renew-modal.vue'

@Component({
	components: {
		Combos,
		PaymentModal,
		RenewModal,
	},
})
export default class Home extends Vue {
	showPayment = false
	showRenew = false
	shouldApprove = false
	canBuy = false
	canRenew = false
	canUpgrade = false
	selectedCombo: Entity.Combo = {
		level: 0,
		bandwidth: BigNumber.from('0'),
		storageAmount: BigNumber.from('0'),
		buildingTime: BigNumber.from('0'),
		pricePerMonth: BigNumber.from('0'),
		isValid: false,
		name: '',
	}

	expiration = 0

	async created() {
		this.updateCanRenew()
		this.updateExpiration()
	}

	async handleComboChange(combo: Entity.Combo) {
		this.selectedCombo = combo
	}

	async updateExpiration() {
		const account = await provider.getSigner().getAddress()
		const expiration = await payment.expiration(account)
		this.expiration = expiration.toNumber()
	}

	async updateCanRenew() {
		const signer = provider.getSigner()
		const from = await signer.getAddress()
		this.canRenew = await payment.canRenew(from)
	}

	get exp() {
		return 'expired on:' + new Date(this.expiration * 1000).toString()
	}

	async pay() {
		this.showPayment = true
	}

	onPaymentModalClose() {
		this.showPayment = false
	}

	async renew() {
		this.showRenew = true
	}

	async onRenewModalClose() {
		this.showRenew = false
	}
}
</script>

<style></style>
