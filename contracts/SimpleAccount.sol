// SPDX License-Identifier: MIT;
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradable.sol";

import "/BaseAccount.sol";
import "/TokenCallbackHandler.sol";

contract SimpleAccount is BaseAccount, TokenCallbackHandler, UUPSUpgradable, Initializable {
    using ECDSA for bytes32;

    address public owner;
    IEntryPoint private immutable _entryPoint;

    event SimpleAccountInitializable(IEntryPoint indexed entrypoint, address indexed owner);

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function entryPoint() public view virtual override returns (IEntrypoint) {
        return _entryPoint;
    }

    receive() external payable {}

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function _onlyOwner() internal view {
        require(msg.sender == owner || msg.sender == address(this), "only owner");
    }

    // ececute a transaction

    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    // execute sequence of transaction
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner; 
        emit simpleAccountInitialized(_entryPoint, owner);
    }

    function _requireFromEntryPointOwner() internal view {
        require(msg.sender == address(entryPoint()) || msg.sender == owner, "account: not Owner of EntryPoint");
    }
    // bring in BaseAccount template method
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal override virtual returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
            return 0;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value : value}(data);
        if (!success) {
            assemly {
            revert(add(result, 32), mload(result))
        }
      }
    }
    // check current account
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }
    // main deposit adding funds
    function addDeposit() public payable {
        entryPoint().depositTo{value : msg.value}(address(this));
    }
    // withdraw value from account deposit
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _onlyOwner();
    }
}

