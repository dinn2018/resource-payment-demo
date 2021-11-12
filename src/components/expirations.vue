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
