'use client';
import { useState } from "react";
import Navbar from "./components/Navbar";

const products = [
  {
    id: 1,
    name: "Xiaomi Pro",
    price: 500,
    stock: 10,
    isBetaTest: false,
    reviews: [
      { reviewer: "0x1234...abcd", rating: 5, comment: "Excellent product!" },
      { reviewer: "0x5678...efgh", rating: 4, comment: "Great, but expensive." },
    ],
  },
  {
    id: 2,
    name: "Xiaomi 100 beta",
    price: 300,
    stock: 5,
    isBetaTest: true,
    reviews: [
      { reviewer: "0x2345...bcde", rating: 3, comment: "Good, but still buggy." },
      { reviewer: "0x6789...fghi", rating: 2, comment: "Not ready for market." },
    ],
  },
  {
    id: 3,
    name: "Huawei 99",
    price: 150,
    stock: 20,
    isBetaTest: false,
    reviews: [
      { reviewer: "0x9876...zyxw", rating: 4, comment: "Solid product for the price." },
      { reviewer: "0x5432...wxyz", rating: 5, comment: "Love it! Affordable and reliable." },
    ],
  },
];

const features = [
  "Register as a User or Company",
  "Purchase Points",
  "Buy Products using Points",
  "Submit Product Reviews",
  "View Reviews for Products",
  "Post Ads",
];

export default function Home() {
  const [activeReviews, setActiveReviews] = useState<number | null>(null); // To track which product's reviews are unlocked
  const [user, setUser] = useState<{ address: string; type: string; purchasedProducts: number[] } | null>(null); // User registration state
  const [points, setPoints] = useState(10); // User's available points
  const [showPersonalInfo, setShowPersonalInfo] = useState(false); // State to control personal info visibility
  const [newReview, setNewReview] = useState<{ productId: number; rating: number; comment: string }>({
    productId: 0,
    rating: 1,
    comment: '',
  });

  // 计算每个产品的平均评分
  const calculateAverageRating = (reviews: { rating: number }[]) => {
    const totalRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
    return reviews.length ? (totalRatings / reviews.length).toFixed(2) : "No ratings yet";
  };

  // 显示产品评论
  const unlockReviews = (productId: number) => {
    if (points >= 1) {
      setActiveReviews(productId);
      setPoints(points - 1); // 扣除1积分
    } else {
      alert("You need at least 1 point to unlock reviews.");
    }
  };

  // 用户注册
  const handleRegistration = (type: string) => {
    const address = type === "User" ? "0x1234...abcd" : "0x5678...efgh";
    setUser({
      address,
      type,
      purchasedProducts: [1, 2], // 假设用户已购买了 "TechTrust Pro" 和 "BetaTest Gadget"
    });
  };

  // 用户提交评价
  const handleSubmitReview = () => {
    if (user && user.purchasedProducts.includes(newReview.productId)) {
      const product = products.find(p => p.id === newReview.productId);
      if (product) {
        product.reviews.push({
          reviewer: user.address,
          rating: newReview.rating,
          comment: newReview.comment,
        });
        alert("Review submitted successfully!");
        setNewReview({ productId: 0, rating: 1, comment: '' }); // 重置评论表单
      }
    } else {
      alert("You must purchase the product to submit a review.");
    }
  };

  // 模拟提现
  const handleWithdraw = () => {
    alert("Withdraw action simulated. No actual transfer.");
  };

  // 模拟展开个人信息
  const togglePersonalInfo = () => {
    setShowPersonalInfo(!showPersonalInfo);
  };

  // 假数据（模拟从后端Solidity获取）
  const fakePersonalInfo = {
    balance: "1500 ETH",
    transactionHistory: [
      { txHash: "0xabc123", amount: "50 ETH", type: "sent" },
      { txHash: "0xdef456", amount: "30 ETH", type: "received" },
      { txHash: "0xghi789", amount: "20 ETH", type: "sent" },
    ],
    registrationDate: "2024-01-01",
    totalSpent: "1200 ETH",
  };

  return (
    <div>
      <Navbar />
      <main className="p-8 bg-gray-50">
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-10">TechTrust Platform</h1>

        {/* 功能展示 */}
        {/* <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold mb-4 text-blue-500">Platform Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="text-lg text-gray-700">{feature}</li>
            ))}
          </ul>
        </section> */}

        {/* 产品列表 */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 text-blue-500">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white shadow-lg rounded-lg p-6">
                <h3 className="text-2xl font-semibold text-gray-800">{product.name}</h3>
                <p className="text-xl font-medium text-blue-500">Price: {product.price} points</p>
                <p className="text-lg text-gray-600">Stock: {product.stock}</p>
                <p className={`text-lg font-semibold ${product.isBetaTest ? 'text-orange-500' : 'text-green-500'}`}>
                  {product.isBetaTest ? "Beta Test" : "Available"}
                </p>

                {/* 显示产品平均分 */}
                <p className="mt-2 text-lg text-gray-700">
                  Average Rating: {calculateAverageRating(product.reviews)} ⭐
                </p>

                {/* 查看评论按钮 */}
                <button
                  className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4 hover:bg-blue-600"
                  onClick={() => unlockReviews(product.id)}
                >
                  View Reviews (1 Point)
                </button>

                {/* 显示评论 */}
                {activeReviews === product.id && (
                  <div className="mt-4 space-y-2">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="p-2 border-t border-gray-200">
                        <p className="font-semibold text-gray-800">{review.reviewer}</p>
                        <p className="text-yellow-500">{'⭐'.repeat(review.rating)}</p>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 用户已购买的商品 */}
        {user && (
          <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-3xl font-semibold mb-4 text-blue-500">Your Purchased Products</h2>
            <ul className="space-y-2">
              {user.purchasedProducts.map((productId) => {
                const product = products.find((p) => p.id === productId);
                return (
                  <li key={productId} className="text-lg text-gray-700">
                    {product?.name}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 提交评论 */}
        {user && (
          <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-3xl font-semibold mb-4 text-blue-500">Submit a Review</h2>
            <div className="flex flex-col gap-4">
              <select
                value={newReview.productId}
                onChange={(e) => setNewReview({ ...newReview, productId: parseInt(e.target.value) })}
                className="border p-2 rounded-md"
              >
                <option value={0}>Select a Product</option>
                {user.purchasedProducts.map((productId) => {
                  const product = products.find((p) => p.id === productId);
                  return (
                    <option key={productId} value={productId}>
                      {product?.name}
                    </option>
                  );
                })}
              </select>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Enter your comment"
                  className="border p-2 rounded-md w-full"
                />
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  className="border p-2 rounded-md"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Stars
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmitReview}
                className="bg-blue-500 text-white px-6 py-2 rounded-full mt-4 hover:bg-blue-600"
              >
                Submit Review
              </button>
            </div>
          </section>
        )}

        {/* 注册用户和公司 */}
        <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold mb-4 text-blue-500">Register</h2>
          <div className="flex gap-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600"
              onClick={() => handleRegistration("User")}
            >
              Register as User
            </button>
            <button
              className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600"
              onClick={() => handleRegistration("Company")}
            >
              Register as Company
            </button>
          </div>

          {/* 显示注册后信息 */}
          {user && (
            <div className="mt-6">
              <p className="text-lg text-gray-700">
                Address: <span className="font-bold text-gray-800">{user.address}</span>
              </p>
              <p className="text-lg text-gray-700">Type: <span className="font-bold text-gray-800">{user.type}</span></p>
            </div>
          )}
        </section>

        {/* 展示个人信息 */}
        {user && (
          <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-3xl font-semibold mb-4 text-blue-500">Your Personal Information</h2>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-full mb-4 hover:bg-gray-600"
              onClick={togglePersonalInfo}
            >
              {showPersonalInfo ? "Hide Personal Info" : "Show Personal Info"}
            </button>

            {showPersonalInfo && (
              <div>
                <p className="text-lg text-gray-700">Balance: <span className="font-bold text-gray-800">{fakePersonalInfo.balance}</span></p>
                <p className="text-lg text-gray-700">Registration Date: <span className="font-bold text-gray-800">{fakePersonalInfo.registrationDate}</span></p>
                <p className="text-lg text-gray-700">Total Spent: <span className="font-bold text-gray-800">{fakePersonalInfo.totalSpent}</span></p>

                <h3 className="text-xl text-blue-500 mt-6">Transaction History:</h3>
                <ul className="space-y-2 mt-4">
                  {fakePersonalInfo.transactionHistory.map((tx, index) => (
                    <li key={index} className="text-gray-700">
                      {tx.type === "sent" ? "Sent" : "Received"}: {tx.amount} (Tx Hash: {tx.txHash})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 模拟提现 */}
        <section className="mb-12 bg-white p-6 shadow-md rounded-lg">
          <h2 className="text-3xl font-semibold mb-4 text-blue-500">Withdraw ETH</h2>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600"
            onClick={handleWithdraw}
          >
            Withdraw
          </button>
        </section>

      </main>
    </div>
  );
}
