import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("TechToken", function () {
  async function deployTechTokenFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const TechToken = await hre.ethers.getContractFactory("TechToken");
    const techToken = await TechToken.deploy(1000); // Initial supply: 1000 tokens

    return { techToken, owner, addr1, addr2 };
  }

  it("Should deploy with correct initial supply", async function () {
    const { techToken, owner } = await loadFixture(deployTechTokenFixture);
    const totalSupply = await techToken.totalSupply();
    const ownerBalance = await techToken.balanceOf(owner.address);

    expect(totalSupply).to.equal(ownerBalance);
    expect(totalSupply).to.equal(1000n * 10n ** 18n); // 1000 tokens with 18 decimals
  });

  it("Should transfer tokens correctly", async function () {
    const { techToken, owner, addr1 } = await loadFixture(deployTechTokenFixture);

    await techToken.transfer(addr1.address, 100); // Transfer 100 tokens

    const addr1Balance = await techToken.balanceOf(addr1.address);

    expect(addr1Balance).to.equal(100);
  });

  it("Should not allow transfer of more tokens than available", async function () {
    const { techToken, addr1 } = await loadFixture(deployTechTokenFixture);

    await expect(techToken.connect(addr1).transfer(addr1.address, 1)).to.be.revertedWith(
      "Insufficient balance"
    );
  });

  it("Should approve tokens for spender", async function () {
    const { techToken, owner, addr1 } = await loadFixture(deployTechTokenFixture);

    await techToken.approve(addr1.address, 200);

    const allowance = await techToken.getAllowance(owner.address, addr1.address);
    expect(allowance).to.equal(200);
  });

  it("Should allow transferFrom by spender", async function () {
    const { techToken, owner, addr1, addr2 } = await loadFixture(deployTechTokenFixture);

    await techToken.approve(addr1.address, 200); // Owner approves addr1 to spend 200 tokens
    await techToken.connect(addr1).transferFrom(owner.address, addr2.address, 150); // addr1 transfers 150 to addr2

    const addr2Balance = await techToken.balanceOf(addr2.address);
    const ownerBalance = await techToken.balanceOf(owner.address);
    const allowance = await techToken.getAllowance(owner.address, addr1.address);

    expect(addr2Balance).to.equal(150);
  });

  it("Should not allow transferFrom exceeding allowance", async function () {
    const { techToken, owner, addr1, addr2 } = await loadFixture(deployTechTokenFixture);

    await techToken.approve(addr1.address, 100); // Owner approves addr1 for 100 tokens

    await expect(
      techToken.connect(addr1).transferFrom(owner.address, addr2.address, 200)
    ).to.be.revertedWith("Allowance exceeded");
  });

  it("Should not allow transferFrom with insufficient balance", async function () {
    const { techToken, addr1, addr2 } = await loadFixture(deployTechTokenFixture);

    await techToken.approve(addr1.address, 100); // addr1 approves addr2 for 100 tokens

    await expect(
      techToken.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
    ).to.be.revertedWith("Insufficient balance");
  });
});
