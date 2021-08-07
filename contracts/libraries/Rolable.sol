// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.00;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

library Rolable {
    using SafeMath for uint256;

    struct Role {
        mapping(address => bool) registeredAccounts;
        mapping(address => bool) activeAccounts;
        uint256 registeredAccountsCount;
        uint256 activeAccountsCount;
    }

    function add(Role storage _role, address _account) internal {
        _role.registeredAccounts[_account] = true;
        _role.registeredAccountsCount = _role.registeredAccountsCount.add(1);
    }

    function remove(Role storage _role, address _account) internal {
        delete _role.registeredAccounts[_account];
        _role.registeredAccountsCount = _role.registeredAccountsCount.sub(1);
    }

    function isRegistered(Role storage _role, address _account)
        internal
        view
        returns (bool)
    {
        if (_role.registeredAccounts[_account]) {
            return true;
        } else {
            return false;
        }
    }

    function isActivated(Role storage _role, address _account)
        internal
        view
        returns (bool)
    {
        if (_role.activeAccounts[_account]) {
            return true;
        } else {
            return false;
        }
    }

    function activate(Role storage _role, address _account) internal {
        _role.activeAccounts[_account] = true;
        _role.activeAccountsCount = _role.activeAccountsCount.add(1);
    }

    function desactivate(Role storage _role, address _account) internal {
        delete _role.activeAccounts[_account];
        _role.activeAccountsCount = _role.activeAccountsCount.sub(1);
    }

    function getRegisteredAccountsCount(Role storage _role)
        internal
        view
        returns (uint256)
    {
        return _role.registeredAccountsCount;
    }

    function getActiveAccountsCount(Role storage _role)
        internal
        view
        returns (uint256)
    {
        return _role.activeAccountsCount;
    }
}
