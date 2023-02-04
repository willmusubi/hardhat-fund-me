// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

error FundMe__NotOwner(); // explitily display the contract name for errors
error FundMe__LessThanMinFundRequired();

/**
 * @title A contract for crowdfunding
 * @author GuiGu
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    uint256 public constant MIN_USD = 20 * 1e18;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(i_owner == msg.sender, "only owner can execute withdraw()");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        donate();
    }

    fallback() external payable {
        donate();
    }

    /**
     * @notice This function funds the contract
     * @dev This implements price feeds as our library
     * @ param
     * @ return
     */
    function donate() public payable {
        if (msg.value.getTotalValue(s_priceFeed) < MIN_USD) {
            revert FundMe__LessThanMinFundRequired();
        }
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // // withdarw the fund
        // payable(msg.sender).transfer(address(this).balance);

        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");

        // resetting everything
        for (uint256 index = 0; index < s_funders.length; index++) {
            s_addressToAmountFunded[s_funders[index]] = 0;
        }
        s_funders = new address[](0);
    }

    function cheaperWithdraw() public onlyOwner {
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");

        address[] memory funders = s_funders;

        for (uint256 index = 0; index < funders.length; index++) {
            s_addressToAmountFunded[funders[index]] = 0;
        }
        s_funders = new address[](0);
    }

    // getters

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }
}
