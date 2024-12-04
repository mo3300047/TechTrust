import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("HelloWorld", function () {
  // Fixture to deploy the contract and set up test accounts
  async function deployQuestSystemFixture() {
    const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
    const helloWorld = await HelloWorld.deploy();

    return { helloWorld };
  }

  it("Should return a hello world", async function () {
    const { helloWorld } = await loadFixture(deployQuestSystemFixture);
    const result = await helloWorld.helloWorld();
    expect(result).to.equal("Hello, World!");
  });
});

/* describe("TechToken", function () {
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
}); */
