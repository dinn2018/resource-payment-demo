import { providers } from 'ethers'
import { ResourcePayment__factory } from './ResourcePayment__factory'
import { ERC20__factory } from './ERC20__factory'
import { ERC20 } from './ERC20'

const paymentAddress = '0x80fE84E9211c7D2C2AEf2d8DEAbEDa04FB1Fc178'
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