import { providers } from 'ethers'
import { ResourcePayment__factory } from './ResourcePayment__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const paymentAddress = '0x9A0BC9c320EaC87F02bc928fD0b240195E0FD4e8'
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