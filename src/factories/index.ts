import { providers } from 'ethers'
import { HostingPayment__factory } from './HostingPayment__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const paymentAddress = '0xb2314Ec9F4aE52aE04f4bcb82c5C03F8A0D6Cad9'
const provider = new providers.Web3Provider(window.ethereum as any)
const payment = HostingPayment__factory.connect(
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