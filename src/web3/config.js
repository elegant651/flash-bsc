import * as depositPool from '../abis/depositPool.json';
import * as flashModule from '../abis/flashModule.json';
import * as bep20 from "../abis/bep20Abi.json";

export const config = {
  depositPoolAbi: depositPool.default,
  depositPoolAddress: "0x40D6f23146F2B96821b2451b8C7d94645d675Fc6",
  flashModuleAbi: flashModule.default,
  flashModuleAddress: "0x78F5DD08A3333F8537AC115fB2FE87A8771b9057",
  bep20Abi: bep20.default,
  bep20Address: ""
}
