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
		const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
		const expiration = await this.payment().expiration(from)
		this.expiration = expiration.toNumber()
	}

	async updateCanRenew() {
		const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
		this.canRenew = await this.payment().canRenew(from)
	}

	get exp() {
		const days = Math.floor(this.expiration / (3600 * 24))
		const hours = Math.floor((this.expiration % (3600 * 24)) / 3600)
		const mins = Math.floor((this.expiration % 3600) / 60)
		const secs = Math.floor(this.expiration % 60)
		return `expired in: ${days}:${hours}:${mins}:${secs}`
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
