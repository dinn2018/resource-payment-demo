<template>
	<div style="width: 100%">
		<a-select
			default-value="0"
			@change="onExpirationChanged"
		>
			<a-select-option
				v-for="(expiration, i) of expirations"
				:key="`${i}-${expiration.value}`"
				:value="`${i}`"
			>
				{{ expiration.title }}
			</a-select-option>
		</a-select>
	</div>
</template>

<script lang="ts">
import { UPDATE_EXPIRATIONS } from '@/store'
import { Component, Vue } from 'vue-property-decorator'

export interface Token {
	index: number
	name: string
	symbol: string
	address: string
}

@Component
export default class Expirations extends Vue {
	async created() {
		if (this.$store.state.expirations.length == 0) {
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
		this.$emit('onExpirationChanged', this.expirations[0])
	}

	get expirations() {
		return this.$store.state.expirations
	}

	async onExpirationChanged(index: number) {
		this.$emit('onExpirationChanged', this.expirations[index])
	}
}
</script>
