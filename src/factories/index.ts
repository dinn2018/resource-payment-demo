import { providers } from 'ethers'
import { ResourcePayment__factory } from './ResourcePayment__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const paymentAddress = '0x9027Cc6320E0D83205644408ff43B70E1Beb2739'
const provider = new providers.Web3Provider(window.ethereum as any)
const payment = ResourcePayment__factory.connect(
	paymentAddress,
	provider
)

const erc20 = (address: string): ERC20 => {
	return ERC20__factory.connect(address, provider)
}


export {
	paymentAddress,
	payment,
	erc20,
	provider
}