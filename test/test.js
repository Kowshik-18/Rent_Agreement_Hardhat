const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RentAgreement", function(){
  let rentAgreement;
  let owner;
  let tenant;

  before(async function(){
    [owner, tenant] = await ethers.getSigners();
    
    const RentAgreement = await ethers.getContractFactory("RentAgreement");
    rentAgreement = await RentAgreement.deploy(owner.address, ethers.utils.parseEther("1"), 12);

    await rentAgreement.deployed();
  });

  it("Should allow the landlord to set the tenant", async function(){
    await rentAgreement.connect(owner).setTenant(tenant.address);
    const setTenantAddress = await rentAgreement.tenant();
    
    if (setTenantAddress !== tenant.address) {

      throw new Error("Failed to set tenant address");

    }
  });

  it("Should allow tenant to pay rent, including penalties if late", async function(){
    const rentAmount = ethers.utils.parseEther("1");
    const penaltyAmount =  rentAmount.mul(10).div(100);

    await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60 ]);
    await ethers.provider.send("evm_mine");

    await rentAgreement.connect(tenant).payRent({value: rentAmount.add(penaltyAmount)});
    
    const rentPaidUntil = await rentAgreement.rentPaidUntil();
    const expectedRentPaidUntil = (await ethers.provider.getBlock('latest')).timestamp + 30 * 24 * 60 * 60;
    expect(rentPaidUntil).to.equal(expectedRentPaidUntil);
  });

  it("Should allow Landlord to withdraw rent", async function(){
    const initialBalance= await owner.getBalance();
    await rentAgreement.connect(owner).withdrawRent();
    const newBalance = await owner.getBalance();
    
    expect(newBalance).to.be.above(initialBalance);
  });

  it("should handle terminiation request and approvals correctly", async function(){
    await rentAgreement.connect(tenant).requestTermination();

    const isTerminationRequested = await rentAgreement.terminationRequested();
    if(!isTerminationRequested){
      throw new Error("Failed to request termination");
    }
    await rentAgreement.connect(owner).approveTermination();

    const isTerminated = await rentAgreement.isTerminated();
    if(!isTerminated){
      throw new Error("failed to approve termination");
    }
  })
});
