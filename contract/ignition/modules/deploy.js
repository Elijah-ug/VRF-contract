// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();

module.exports = buildModule("ColorDropLotteryModule", (m) => {

  const depositAmount = m.getParameter("subscriptionId", process.env.CHAINLINK_SUBSCRIPTION_ID)
  const minimumDeposit = ethers.parseUnits("0.0001", "ether");
  const ColorDropLotteryGame = m.contract("ColorDropLottery", [depositAmount, minimumDeposit]);
  return { ColorDropLotteryGame }
// 0xd341f272b89E5885136001F69b647182A054c045
})
