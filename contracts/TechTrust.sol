// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TechTrust {

    // 定义合约拥有者（部署者）
    address public owner;

    // 用户账户结构体
    struct User {
        uint256 points;  // 用户的积分数量
        bool isRegistered;  // 用户是否注册
        mapping(uint256 => uint256) pledgedPoints; // 记录每个产品的质押积分
        uint256[] reviewedProductIds;  // 用户已经评论过的产品ID列表
    }

    // 公司账户结构体
    struct Company {
        uint256 points;  // 公司账户的积分数量
        bool isRegistered;  // 公司是否注册
    }

    // 产品结构体
    struct Product {
        string name;  // 产品名称
        uint256 price;  // 产品价格（以积分为单位）
        uint256 stock;  // 库存数量
        uint256 totalReviews;  // 总评论数
        uint256 totalRating;  // 总评分数
        bool isBetaTest;  // 是否为内测版
    }

    // 评论结构体
    struct Review {
        uint256 productId;  // 产品ID
        address reviewer;  // 评论者地址
        uint8 rating;  // 评分（1-5）
        string comment;  // 评论内容
    }

    // 定义映射，记录每个地址（用户/公司）的账户信息
    mapping(address => User) private users;
    mapping(address => Company) private companies;

    // 定义映射，记录每个产品的详细信息
    mapping(uint256 => Product) private products;

    // 定义映射，记录每个产品的所有评论
    mapping(uint256 => Review[]) private productReviews;

    // 当前产品的数量（自动递增）
    uint256 public productCount;

    // 平台的广告收入
    uint256 public adRevenue;

    // 事件定义
    event ProductAdded(uint256 productId, string name, uint256 price, uint256 stock, bool isBetaTest);
    event ProductPurchased(address buyer, uint256 productId, uint256 points);
    event ReviewSubmitted(address reviewer, uint256 productId, uint8 rating);
    event AdPosted(address company, uint256 points, uint256 duration);
    event PointsRefunded(address user, uint256 productId, uint256 points);
    event ReviewsListed(uint256 productId, Review[] reviews);
    event AccountInfo(address user, uint256 points, uint256[] reviewedProductIds);
    event PointsPurchased(address indexed user, uint256 points, uint256 ethSpent);


    // 修饰符：限制只有合约拥有者可以调用的函数
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    // 修饰符：限制只有注册用户可以调用的函数
    modifier onlyUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    // 修饰符：限制只有注册公司可以调用的函数
    modifier onlyCompany() {
        require(companies[msg.sender].isRegistered, "Company not registered");
        _;
    }

    // 合约构造函数，设置合约的拥有者
    constructor() {
        owner = msg.sender;
    }

    // 注册普通用户
    function registerUser() public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender].points = 300;  // 用户注册时赠送300积分
        users[msg.sender].isRegistered = true;
    }

    // 注册公司账户
    function registerCompany() public {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        companies[msg.sender].points = 3000;  // 公司注册时赠送3000积分
        companies[msg.sender].isRegistered = true;
    }

    // 用户购买积分
    function buyPoints(uint256 pointsToBuy) public payable onlyUser {
        require(pointsToBuy > 0, "You must specify a positive number of points to buy");

        // 计算所需的 ETH（每10积分对应1ETH）
        uint256 requiredETH = pointsToBuy * 1 ether / 10;

        // 检查用户发送的 ETH 是否足够
        require(msg.value >= requiredETH, "Not enough ETH sent");

        // 更新用户的积分
        users[msg.sender].points += pointsToBuy;

        // 如果多发送了 ETH，退还多余的部分
        uint256 excessETH = msg.value - requiredETH;
        if (excessETH > 0) {
            payable(msg.sender).transfer(excessETH); // 退还多余的ETH
        }

        emit PointsPurchased(msg.sender, pointsToBuy, requiredETH);  // 触发事件通知前端
    }


    // 添加新产品（只有公司账户可以添加产品）
    function addProduct(string memory name, uint256 price, uint256 stock, bool isBetaTest) public onlyCompany {
        productCount++;  // 自动递增产品ID
        products[productCount] = Product(name, price, stock, 0, 0, isBetaTest);
        emit ProductAdded(productCount, name, price, stock, isBetaTest);
    }

    // 用户购买产品
    function buyProduct(uint256 productId) public onlyUser {
        Product storage product = products[productId];
        require(product.stock > 0, "Product out of stock");
        require(users[msg.sender].points >= product.price, "Not enough points");

        users[msg.sender].points -= product.price;  // 扣除用户积分
        product.stock--;  // 减少库存
        emit ProductPurchased(msg.sender, productId, product.price);

        // 如果是内测版，要求用户质押相应积分
        if (product.isBetaTest) {
            users[msg.sender].pledgedPoints[productId] = product.price;
        }
    }

    // 提交评论和评分
    function submitReview(uint256 productId, uint8 rating, string memory comment) public onlyUser {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(!hasReviewed(msg.sender, productId), "You have already reviewed this product");

        Product storage product = products[productId];
        product.totalReviews++;  // 增加评论数
        product.totalRating += rating;  // 增加评分数

        productReviews[productId].push(Review(productId, msg.sender, rating, comment));
        users[msg.sender].reviewedProductIds.push(productId);  // 保存已评论的产品ID
        
        // 如果是内测版，退还质押积分
        if (product.isBetaTest) {
            uint256 pledgedPoints = users[msg.sender].pledgedPoints[productId];
            if (pledgedPoints > 0) {
                users[msg.sender].points += pledgedPoints;  // 退还质押积分
                users[msg.sender].pledgedPoints[productId] = 0;
                emit PointsRefunded(msg.sender, productId, pledgedPoints);
            }
        }

        emit ReviewSubmitted(msg.sender, productId, rating);
    }

    // 查看用户是否已评论某个产品
    function hasReviewed(address user, uint256 productId) public view returns (bool) {
        for (uint i = 0; i < productReviews[productId].length; i++) {
            if (productReviews[productId][i].reviewer == user) {
                return true;
            }
        }
        return false;
    }

    // 获取产品的平均评分
    function getProductRating(uint256 productId) public view returns (uint256) {
        Product storage product = products[productId];
        if (product.totalReviews == 0) {
            return 0;  // 如果没有评论，返回0
        }
        return product.totalRating / product.totalReviews;  // 返回平均评分
    }

    // 查看产品评论（每次查看评论需要支付1个积分）
    function viewReviews(uint256 productId) public onlyUser {
        require(users[msg.sender].points >= 1, "You need at least 1 point to view reviews");
        users[msg.sender].points -= 1;  // 扣除查看评论的积分

        // 获取所有评论
        Review[] memory reviews = productReviews[productId];
        require(reviews.length > 0, "No reviews for this product");

        // 通过事件返回评论信息
        emit ReviewsListed(productId, reviews);
    }

    // 列举所有产品信息
    function listAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            allProducts[i - 1] = products[i];
        }
        return allProducts;
    }

    // 查看自己的账户信息（积分余额、评论情况）
    function viewAccountInfo() public onlyUser view returns (uint256, uint256[] memory){
        User storage user = users[msg.sender];
        // emit AccountInfo(msg.sender, user.points, user.reviewedProductIds);
        // 返回积分余额和已评论的产品ID数组
        return (user.points, user.reviewedProductIds);
    }

    // 公司投放广告
    function postAd(uint256 points, uint256 duration) public onlyCompany {
        require(companies[msg.sender].points >= points, "Not enough points");
        companies[msg.sender].points -= points;  // 扣除广告费用
        adRevenue += points;  // 平台收入增加
        emit AdPosted(msg.sender, points, duration);
    }

    // 合约中的ETH提现（只有合约拥有者可以提取）
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // 接收ETH（当用户购买积分时，合约会收到ETH）
    receive() external payable {}
}
