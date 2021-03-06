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
					<div v-if="canUpgrade">
						<div>convert left into upgrading: {{ formatUpgradeExp }}</div>
						<div>max upgrading expiration: {{ formatMaxUpgradeExp }}</div>
					</div>
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
						v-show="canBuy"
						type="primary"
						@click="buy"
					>
						Buy
					</a-button>
					<a-button
						v-show="canUpgrade"
						type="primary"
						@click="upgrade"
					>
						Upgrade
					</a-button>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { BigNumber } from 'ethers'
import { formatToken, uint256Max } from '@/utils'
import Tokens from '@/components/tokens.vue'
import Expirations from '@/components/expirations.vue'

@Component({
	components: {
		Tokens,
		Expirations,
	},
	methods: {
		formatToken,
	},
})
export default class PaymentModal extends Vue {
	selectedToken: Entity.Token = { index: 0, name: '', symbol: '', address: '' }
	selectedExpiration: Entity.Expiration = { value: 0, title: '' }
	shouldApprove = false

	visible = false
	canBuy = false
	canUpgrade = false

	upgradingExp = 0
	maxUpgradingExp = 0

	cost: BigNumber = BigNumber.from('0')

	@Watch('show')
	onShow(newValue: boolean) {
		if (!this.selectedToken) {
			this.selectedToken = this.$store.state.tokens[0]
		}
		this.visible = newValue
		this.updateBtn()
	}

	@Prop()
	show = false

	@Prop()
	combo!: Entity.Combo

	@Watch('combo')
	async comboChanged(c: Entity.Combo) {
		await this.handleExpirationChange(this.selectedExpiration)
	}

	async handleTokenChange(token: Entity.Token) {
		this.selectedToken = token
		await this.updateBtn()
	}

	async handleExpirationChange(exp: Entity.Expiration) {
		this.selectedExpiration = exp
		const combo = await this.payment().combos(this.combo?.level ?? 0)
		if (combo.isValid) {
			this.cost = await this.payment().getComboCost(
				this.combo?.level ?? 0,
				this.selectedExpiration.value
			)
		}
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
			await this.updateBtn()
		} catch (e) {
			this.popError(e)
		}
	}

	async buy() {
		try {
			const signer = await this.signer()
			const from = await this.account()
			const data = this.payment().interface.encodeFunctionData('buy', [
				'0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b',
				this.selectedToken.index,
				this.combo.level,
				this.selectedExpiration.value,
			])

			const tx = await signer.sendTransaction({
				from,
				to: this.paymentAddress,
				data,
			})
			await tx.wait()
			this.updateBtn()
		} catch (e) {
			this.popError(e)
		}
	}

	async upgrade() {
		try {
			const signer = await this.signer()
			const from = await this.account()
			const data = this.payment().interface.encodeFunctionData('upgrade', [
				'0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b',
				this.selectedToken.index,
				this.combo.level,
				this.selectedExpiration.value,
			])
			const tx = await signer.sendTransaction({
				from,
				to: this.paymentAddress,
				data,
			})
			await tx.wait()
			this.updateBtn()
		} catch (e) {
			this.popError(e)
		}
	}

	async updateBtn() {
		const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
		this.canBuy = await this.payment().canBuy(from, this.combo?.level ?? 0)
		this.canUpgrade = await this.payment().canUpgrade(
			from,
			this.combo?.level ?? 0
		)
		this.checkApprove()
		this.exchangedUpgradeExp()
	}

	async exchangedUpgradeExp() {
		if (this.canUpgrade) {
			const from = '0xe739d6ce0e554d92bbdcc294f7b7e68abf436930c1d5402cbdcc8f9b'
			const upgraded = await this.payment().getUpgradeExchange(
				from,
				this.combo?.level ?? 0
			)
			this.upgradingExp = upgraded.toNumber()
			const max = await this.payment().maxTotalUpgradeExpiration(
				from,
				this.combo.level
			)
			this.maxUpgradingExp = max.toNumber()
		}
	}

	get formatUpgradeExp() {
		return Math.floor(this.upgradingExp / 3600 / 24) + ' days'
	}

	get formatMaxUpgradeExp() {
		return Math.floor(this.maxUpgradingExp / 3600 / 24) + ' days'
	}

	async checkApprove() {
		if (this.selectedToken) {
			const from = await this.account()
			const erc = this.erc20(this.selectedToken.address)
			const allowance = await erc.allowance(from, this.paymentAddress)
			const minAllowance = uint256Max.shr(1)
			this.shouldApprove = allowance.lt(minAllowance)
		}
	}

	@Emit()
	close() {}
}
</script>
