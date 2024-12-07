import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TechTrust Contract", function () {

  async function deployFixture() {
    const [owner, user1, user2, company1] = await ethers.getSigners();
    const TechTrust = await ethers.getContractFactory("TechTrust");


    const techTrust = await TechTrust.deploy();
    await techTrust.waitForDeployment();

    return { techTrust, owner, user1, user2, company1 };
  }

  it("should allow users to register and grant initial points", async function () {
    const { techTrust, user1 } = await loadFixture(deployFixture);
    await techTrust.connect(user1).registerUser();

    const [points, isRegistered, reviewedProductIds] = await techTrust.getUserInfo(user1.address);
    expect(isRegistered).to.equal(true);
    expect(points).to.equal(300);
    expect(reviewedProductIds).to.deep.equal([]);
  });

  it("should allow companies to register and grant initial points", async function () {
    const { techTrust, company1 } = await loadFixture(deployFixture);
    await techTrust.connect(company1).registerCompany();

    const [points, isRegistered] = await techTrust.getCompanyInfo(company1.address);
    expect(isRegistered).to.equal(true);
    expect(points).to.equal(3000);
  });

  it("should allow users to buy points with ETH", async function () {
    const { techTrust, user1 } = await loadFixture(deployFixture);
    await techTrust.connect(user1).registerUser();

    const ethToSend = ethers.parseEther("1"); 
    await techTrust.connect(user1).buyPoints(10, { value: ethToSend });

    const [points] = await techTrust.getUserInfo(user1.address);
    expect(points).to.equal(310); // 300 initial + 10 purchased
  });

  it("should allow companies to add new products", async function () {
    const { techTrust, company1 } = await loadFixture(deployFixture);
    await techTrust.connect(company1).registerCompany();

    await techTrust.connect(company1).addProduct("Product 1", 100, 50, false);

    const [name, price, stock, totalReviews, totalRating, isBetaTest] = await techTrust.getProduct(1);
    expect(name).to.equal("Product 1");
    expect(price).to.equal(100);
    expect(stock).to.equal(50);
    expect(isBetaTest).to.equal(false);
  });

  it("should allow users to buy products", async function () {
    const { techTrust, user1, company1 } = await loadFixture(deployFixture);
    await techTrust.connect(user1).registerUser();
    await techTrust.connect(company1).registerCompany();
    await techTrust.connect(company1).addProduct("Product 1", 100, 50, false);

    await techTrust.connect(user1).buyProduct(1);

    const [, , stock] = await techTrust.getProduct(1);
    const [points] = await techTrust.getUserInfo(user1.address); 

    expect(stock).to.equal(49); // Decrement stock
    expect(points).to.equal(200); // Deduct product price
  });

  it("should calculate average product ratings", async function () {
    const { techTrust, user1, user2, company1 } = await loadFixture(deployFixture);
    await techTrust.connect(user1).registerUser();
    await techTrust.connect(user2).registerUser();
    await techTrust.connect(company1).registerCompany();
    await techTrust.connect(company1).addProduct("Product 1", 100, 50, false);

    await techTrust.connect(user1).buyProduct(1);
    await techTrust.connect(user2).buyProduct(1);

    await techTrust.connect(user1).submitReview(1, 4, "Good product");
    await techTrust.connect(user2).submitReview(1, 5, "Excellent!");

    const avgRating = await techTrust.getProductRating(1);
    expect(avgRating).to.equal(4); 
  });

  it("should allow the owner to withdraw contract ETH", async function () {
    const { techTrust, owner, user1 } = await loadFixture(deployFixture);
    await techTrust.connect(user1).registerUser();

    const ethToSend = ethers.parseEther("1");
    await techTrust.connect(user1).buyPoints(10, { value: ethToSend });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const tx = await techTrust.connect(owner).withdraw();
    await tx.wait();
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
  });

  it("should not allow non-owner to withdraw", async function () {
    const { techTrust, user1 } = await loadFixture(deployFixture);
    await expect(techTrust.connect(user1).withdraw()).to.be.revertedWith("Only owner can call this");
  });
});
