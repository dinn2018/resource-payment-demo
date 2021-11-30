import { providers } from 'ethers'
import { HostingPayment__factory } from './HostingPayment__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const paymentAddress = '0x526210781b9B6CA708274E58D277FB150ffE8D6a'
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