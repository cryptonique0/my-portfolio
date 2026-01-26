// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LayerZeroMessenger
 * @dev Cross-chain messaging using LayerZero protocol
 * Enables reliable cross-chain airdrop distribution
 */
interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;

    function getInboundNonce(uint16 _chainID, bytes calldata _srcAddress)
        external
        view
        returns (uint256);

    function getOutboundNonce(uint16 _dstChainId, address _srcAddress)
        external
        view
        returns (uint256);
}

interface ILayerZeroReceiver {
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external;
}

contract LayerZeroMessenger is Ownable, ReentrancyGuard, ILayerZeroReceiver {
    using SafeERC20 for IERC20;

    // Layer Zero chain IDs
    uint16 public constant ETHEREUM_LZ_ID = 101;
    uint16 public constant ARBITRUM_LZ_ID = 110;
    uint16 public constant OPTIMISM_LZ_ID = 111;
    uint16 public constant POLYGON_LZ_ID = 109;
    uint16 public constant AVALANCHE_LZ_ID = 106;
    uint16 public constant BASE_LZ_ID = 184;

    // Message types
    enum MessageType {
        AIRDROP_DISTRIBUTION,
        ALLOCATION_UPDATE,
        CLAIM_NOTIFICATION,
        BRIDGE_STATUS
    }

    struct CrossChainMessage {
        uint256 messageId;
        uint16 sourceChainId;
        uint16 destChainId;
        MessageType messageType;
        address sender;
        bytes payload;
        uint256 timestamp;
        bool processed;
    }

    struct AirdropPayload {
        address token;
        address recipient;
        uint256 amount;
        uint256 campaignId;
    }

    // State variables
    ILayerZeroEndpoint public lzEndpoint;
    mapping(uint16 => bytes) public trustedRemotes;
    mapping(uint256 => CrossChainMessage) public messages;
    mapping(address => uint256[]) public userMessages;
    mapping(uint16 => mapping(address => bool)) public processedMessages;

    uint256 public messageCounter = 1;
    uint256 public gasForLzReceive = 350000;

    // Events
    event CrossChainMessageSent(
        uint256 indexed messageId,
        uint16 indexed dstChainId,
        MessageType indexed messageType,
        address sender
    );

    event CrossChainMessageReceived(
        uint256 indexed messageId,
        uint16 indexed srcChainId,
        MessageType indexed messageType,
        bytes payload
    );

    event TrustedRemoteSet(uint16 indexed chainId, bytes trustedRemote);

    event AirdropDistributed(
        uint256 indexed campaignId,
        address indexed recipient,
        address token,
        uint256 amount,
        uint16 destChainId
    );

    modifier onlyLzEndpoint() {
        require(msg.sender == address(lzEndpoint), "Invalid endpoint");
        _;
    }

    /**
     * @dev Initialize with LayerZero endpoint
     */
    constructor(address _lzEndpoint) {
        require(_lzEndpoint != address(0), "Invalid endpoint");
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
    }

    /**
     * @dev Set trusted remote for a chain
     */
    function setTrustedRemote(uint16 _chainId, bytes calldata _trustedRemote)
        external
        onlyOwner
    {
        trustedRemotes[_chainId] = _trustedRemote;
        emit TrustedRemoteSet(_chainId, _trustedRemote);
    }

    /**
     * @dev Send airdrop distribution message
     */
    function sendAirdropDistribution(
        uint16 _dstChainId,
        address _token,
        address _recipient,
        uint256 _amount,
        uint256 _campaignId,
        bytes calldata _adapterParams
    )
        external
        payable
        nonReentrant
        returns (uint256 messageId)
    {
        require(trustedRemotes[_dstChainId].length > 0, "Untrusted remote");
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");
        require(msg.value > 0, "Insufficient gas fee");

        // Encode payload
        bytes memory payload = abi.encode(
            MessageType.AIRDROP_DISTRIBUTION,
            _token,
            _recipient,
            _amount,
            _campaignId
        );

        // Send via LayerZero
        lzEndpoint.send{value: msg.value}(
            _dstChainId,
            trustedRemotes[_dstChainId],
            payload,
            payable(msg.sender),
            address(0),
            _adapterParams
        );

        messageId = messageCounter++;

        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.sourceChainId = ETHEREUM_LZ_ID; // Current chain (can be dynamic)
        message.destChainId = _dstChainId;
        message.messageType = MessageType.AIRDROP_DISTRIBUTION;
        message.sender = msg.sender;
        message.payload = payload;
        message.timestamp = block.timestamp;

        userMessages[_recipient].push(messageId);

        emit CrossChainMessageSent(
            messageId,
            _dstChainId,
            MessageType.AIRDROP_DISTRIBUTION,
            msg.sender
        );
    }

    /**
     * @dev Send allocation update message
     */
    function sendAllocationUpdate(
        uint16 _dstChainId,
        uint256 _campaignId,
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        bytes calldata _adapterParams
    )
        external
        payable
        nonReentrant
    {
        require(trustedRemotes[_dstChainId].length > 0, "Untrusted remote");
        require(_recipients.length == _amounts.length, "Array length mismatch");
        require(msg.value > 0, "Insufficient gas fee");

        bytes memory payload = abi.encode(
            MessageType.ALLOCATION_UPDATE,
            _campaignId,
            _recipients,
            _amounts
        );

        lzEndpoint.send{value: msg.value}(
            _dstChainId,
            trustedRemotes[_dstChainId],
            payload,
            payable(msg.sender),
            address(0),
            _adapterParams
        );

        uint256 messageId = messageCounter++;

        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.destChainId = _dstChainId;
        message.messageType = MessageType.ALLOCATION_UPDATE;
        message.sender = msg.sender;
        message.payload = payload;
        message.timestamp = block.timestamp;

        emit CrossChainMessageSent(
            messageId,
            _dstChainId,
            MessageType.ALLOCATION_UPDATE,
            msg.sender
        );
    }

    /**
     * @dev Receive cross-chain message (called by LayerZero)
     */
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    )
        external
        override
        onlyLzEndpoint
    {
        bytes memory trustedRemote = trustedRemotes[_srcChainId];
        require(
            _srcAddress.length == trustedRemote.length &&
            keccak256(_srcAddress) == keccak256(trustedRemote),
            "Untrusted source"
        );

        require(
            !processedMessages[_srcChainId][_srcAddress],
            "Message already processed"
        );

        processedMessages[_srcChainId][_srcAddress] = true;

        (MessageType messageType) = abi.decode(_payload, (MessageType));

        if (messageType == MessageType.AIRDROP_DISTRIBUTION) {
            _processAirdropDistribution(_payload);
        } else if (messageType == MessageType.ALLOCATION_UPDATE) {
            _processAllocationUpdate(_payload);
        }

        uint256 messageId = messageCounter++;
        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.sourceChainId = _srcChainId;
        message.messageType = messageType;
        message.payload = _payload;
        message.timestamp = block.timestamp;
        message.processed = true;

        emit CrossChainMessageReceived(messageId, _srcChainId, messageType, _payload);
    }

    /**
     * @dev Process airdrop distribution message
     */
    function _processAirdropDistribution(bytes calldata _payload) internal {
        (
            MessageType messageType,
            address token,
            address recipient,
            uint256 amount,
            uint256 campaignId
        ) = abi.decode(_payload, (MessageType, address, address, uint256, uint256));

        // Distribute tokens (would be minted or transferred from reserve)
        // Implementation depends on bridge mechanism
        emit AirdropDistributed(campaignId, recipient, token, amount, 0);
    }

    /**
     * @dev Process allocation update message
     */
    function _processAllocationUpdate(bytes calldata _payload) internal {
        (
            MessageType messageType,
            uint256 campaignId,
            address[] memory recipients,
            uint256[] memory amounts
        ) = abi.decode(_payload, (MessageType, uint256, address[], uint256[]));

        // Update allocations
        // Implementation depends on storage mechanism
    }

    /**
     * @dev Get message details
     */
    function getMessage(uint256 messageId)
        external
        view
        returns (CrossChainMessage memory)
    {
        return messages[messageId];
    }

    /**
     * @dev Get user messages
     */
    function getUserMessages(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userMessages[user];
    }

    /**
     * @dev Get LayerZero quote for message
     */
    function getLayerZeroQuote(
        uint16 _dstChainId,
        bytes calldata _adapterParams
    )
        external
        view
        returns (uint256 nativeFee, uint256 zroFee)
    {
        // This would call lzEndpoint.estimateFees
        // Implementation depends on LayerZero version
    }

    /**
     * @dev Set gas for LZ receive
     */
    function setGasForLzReceive(uint256 _gas) external onlyOwner {
        gasForLzReceive = _gas;
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    receive() external payable {}
}
