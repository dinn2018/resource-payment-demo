import Vuex from 'vuex'
import Vue from 'vue'
Vue.use(Vuex)

export const UPDATE_ACCOUNT = 'update-account'
export const UPDATE_CHAINID = 'update-chainId'
export const UPDATE_TOKENS = 'update-tokens'
export const UPDATE_COMBOS = 'update-combos'
export const UPDATE_EXPIRATIONS = 'update-expirations'

interface AccountState {
	account: string
	chainId: string
	tokens: Entity.Token[]
	combos: Entity.Combo[]
	expirations: Entity.Expiration[]
}

class Store extends Vuex.Store<AccountState>{
	constructor() {
		super({
			state: {
				account: '',
				chainId: '',
				tokens: [],
				combos: [],
				expirations: []
			},
			mutations: {
				[UPDATE_ACCOUNT](state: AccountState, account: string) {
					state.account = account
				},
				[UPDATE_CHAINID](state: AccountState, chainId: string) {
					state.chainId = chainId
				},
				[UPDATE_TOKENS](state: AccountState, tokens: Entity.Token[]) {
					state.tokens = tokens
				},
				[UPDATE_COMBOS](state: AccountState, combos: Entity.Combo[]) {
					state.combos = combos
				},
				[UPDATE_EXPIRATIONS](state: AccountState, expirations: Entity.Expiration[]) {
					state.expirations = expirations
				},
			}
		})
	}

	public init(state: AccountState) {
		this.commit(UPDATE_ACCOUNT, state.account)
		this.commit(UPDATE_CHAINID, state.chainId)
	}

}

const store = new Store()

export default store