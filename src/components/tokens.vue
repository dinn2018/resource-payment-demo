<template>
	<div style="width: 100%">
		<a-select
			default-value="0"
			@change="onTokenChanged"
		>
			<a-select-option
				v-for="(token, i) of tokens"
				:key="`${i}-${token.address}`"
				:value="`${i}`"
			>
				{{ token.symbol }}
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
export default class Tokens extends Vue {
	async created() {
		this.$emit('onTokenChanged', this.tokens[0])
	}

	get tokens() {
		return this.$store.state.tokens
	}

	async onTokenChanged(index: number) {
		this.$emit('onTokenChanged', this.tokens[index])
	}
}
</script>
