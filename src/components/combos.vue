<template>
	<div style="width: 100%">
		<div style="background-color: #eeeeee; padding: 20px">
			<a-row :gutter="16">
				<a-col
					v-for="(combo, i) of combos"
					:key="`${i}-${combo.level}`"
					:span="12"
					:value="`${i}`"
				>
					<a-card
						:title="combo.name"
						:class="selectedIndex == i ? 'highlight' : ''"
						@click="onComboChanged(i)"
					>
						<p>bandwidth: {{ formatSize(combo.bandwidth) }}</p>
						<p>storage: {{ formatSize(combo.storageAmount) }}</p>
						<p>buildingTime: {{ formatBuidingTime(combo.buildingTime) }}</p>
						<p>price per month: {{ formatPrice(combo.pricePerMonth) }}</p>
					</a-card>
				</a-col>
			</a-row>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { BigNumber } from 'ethers'
import { UPDATE_COMBOS } from '@/store'

@Component
export default class Combos extends Vue {
	selectedIndex = 0

	async created() {
		if (this.$store.state.combos.length == 0) {
			const combos = []
			const totalCombos = await this.payment().comboLength()
			const l = totalCombos.toNumber()
			for (let i = 0; i < l; i++) {
				const combo = await this.payment().combos(i)
				combos.push({ level: i, ...combo })
			}
			this.$store.commit(UPDATE_COMBOS, combos)
		}
		this.$emit('onComboChanged', this.combos[this.selectedIndex])
	}

	get combos() {
		return this.$store.state.combos
	}

	formatSize(size: BigNumber) {
		const onegb = BigNumber.from('1').shl(30)
		return size.div(onegb).toString() + 'GB'
	}

	formatBuidingTime(time: BigNumber) {
		return time.div(BigNumber.from('60')).toString() + 'min'
	}

	formatPrice(price: BigNumber) {
		return price.div(BigNumber.from((1e18).toString())).toString() + 'U'
	}

	async getCurrentLevel() {
		const a = await this.getAccount()
		const receipt = await this.payment().receipts(a)
		return receipt.level.toNumber()
	}

	async onComboChanged(index: number) {
		this.selectedIndex = index
		this.$emit('onComboChanged', this.combos[index])
	}
}
</script>

<style>
.highlight {
	background-color: cyan;
}
</style>
