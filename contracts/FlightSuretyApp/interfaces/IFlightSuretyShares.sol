// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;

interface IFlightSuretyShares {
    /** caller authorization */

    // authorize a new caller to call the contract
    function authorizeCaller(address _caller) external;

    // remove an existing caller rights to call the contract
    function unauthorizeCaller(address _caller) external;

    // is ERC20 : fetch the current totla supply of the token
    function totalSupply() external view returns (uint256);

    // is ERC20 : fetch the current balance of an account
    function balanceOf(address account) external view returns (uint256);

    // is ERC20 : fetch the ownership block number of an address aka block num from witch the account has been credited of a certain amount of token
    function ownershipBlockNum(address account) external view returns (uint256);

    // minting token
    function mint(address account, uint256 amount) external;

    // burning token
    function burn(address account, uint256 amount) external;

    // is ERC20 : fetch minimum block number from wich a token can be redeemed
    function blockNumBeforeRedeem(address account)
        external
        view
        returns (uint256);
}
