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
