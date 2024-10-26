const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const RENT_AMOUNT = 1_000_000_000n; 
const DURATION_MONTHS =12;

module.exports = buildModule("RentAgreementModule", (m) =>{
  const landlordAddress = m.getParameter("landlordAddress", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

  const rentAmount = m.getParameter("rentAmount", RENT_AMOUNT);
  const durationMonths = m.getParameter("durationMonths", DURATION_MONTHS);
  
  const rentAgreement = m.contract("RentAgreement", [landlordAddress, rentAmount, durationMonths]);

  return { rentAgreement };

})

