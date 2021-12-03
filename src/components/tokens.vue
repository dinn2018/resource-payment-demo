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
import { UPDATE_TOKENS } from '@/store'
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
		if (this.$store.state.tokens.length == 0) {
			const totalTokens = await this.payment().tokenLength()
			let l = totalTokens.toNumber()
			const tokens = []
			for (let i = 0; i < l; i++) {
				let address = await this.payment().tokens(i)
				const erc = this.erc20(address)
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
