import { Decimal } from "decimal.js";

const add = async (value, decimals) => {
  return String(await new Decimal(value)
    .times(new Decimal(10).pow(decimals)));
}

const remove = async (value, decimals) => {
  return Number(await new Decimal(value)
    .dividedBy(new Decimal(10).pow(decimals)));
}

export const precision = {
  add,
  remove,
};
