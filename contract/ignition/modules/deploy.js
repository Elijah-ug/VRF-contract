const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("ethers");

module.exports = buildModule("ColorDropLottery", (m) => {
  const subId = 318; // Replace with your actual subscription ID
  const minDeposit = m.getParameter("minDeposit", ethers.parseEther("0.0001")); // 0.0001 ETH

  const lottery = m.contract("ColorDropLottery", [subId, minDeposit]);

  return { lottery };
});
