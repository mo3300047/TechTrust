// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TechToken {
    string public name = "TechToken"; // 代币名称
    string public symbol = "TT";   // 代币符号
    uint8 public decimals = 18;     // 小数位数，通常为18
    uint256 public totalSupply;     // 总供应量

    // 映射存储每个账户的余额
    mapping(address => uint256) public balanceOf;

    // 映射存储授权账户可以使用的代币数额
    mapping(address => mapping(address => uint256)) public allowance;

    // 事件：代币转账时触发
    event Transfer(address indexed from, address indexed to, uint256 value);

    // 事件：授权转账时触发
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // 构造函数：部署合约时初始化总供应量
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** uint256(decimals);  // 总供应量需要乘以 10^decimals
        balanceOf[msg.sender] = totalSupply; // 部署者拥有所有代币
    }

    // 转账函数
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // 授权函数：授权另一个地址可以使用一定数量的代币
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // 从授权地址转账函数
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_from != address(0), "Invalid address");
        require(_to != address(0), "Invalid address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    // 修改函数名以避免与 mapping 冲突
    // 查询某个地址的授权额度
    function getAllowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowance[_owner][_spender];
    }
}
