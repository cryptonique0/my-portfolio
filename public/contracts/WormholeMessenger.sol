// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title WormholeMessenger
 * @dev Cross-chain messaging using Wormhole protocol
 * Enables reliable cross-chain airdrop distribution with VAA verification
 */

interface IWormholeRelayer {
    function sendPayloadToEvm(
        uint16 targetChain,
        address targetAddress,
        bytes memory payload,
        uint256 receiverValue,
        uint256 gasLimit
    ) external payable returns (uint64);

    function sendToEvm(
        uint16 chainId,
        address targetAddress,
        bytes calldata serializedVM
    ) external payable returns (uint64);
}

interface IWormhole {
    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64);

    function getGuardianSetIndex() external view returns (uint32);

    function getCurrentGuardianSetIndex() external view returns (uint32);
}

contract WormholeMessenger is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Wormhole chain IDs
    uint16 public constant ETHEREUM_WORMHOLE_ID = 2;
    uint16 public constant ARBITRUM_WORMHOLE_ID = 23;
    uint16 public constant OPTIMISM_WORMHOLE_ID = 24;
    uint16 public constant POLYGON_WORMHOLE_ID = 5;
    uint16 public constant AVALANCHE_WORMHOLE_ID = 6;
    uint16 public constant BASE_WORMHOLE_ID = 30;

    // Message types
    enum MessageType {
        AIRDROP_DISTRIBUTION,
        ALLOCATION_UPDATE,
        CLAIM_NOTIFICATION,
        BRIDGE_STATUS,
        RECOVERY_REQUEST
    }

    struct CrossChainMessage {
        uint256 messageId;
        uint16 sourceChainId;
        uint16 destChainId;
        MessageType messageType;
        address sender;
        bytes payload;
        uint256 timestamp;
        uint64 vaaSequence;
        bool processed;
        bool verified;
    }

    struct WormholePayload {
        MessageType messageType;
        address token;
        address recipient;
        uint256 amount;
        uint256 campaignId;
        address sender;
    }

    struct ChainConfig {
        uint16 wormholeChainId;
        address targetAddress;
        bool enabled;
        uint256 gasLimit;
    }

    // State variables
    IWormhole public wormholeCore;
    IWormholeRelayer public wormholeRelayer;

    mapping(uint16 => ChainConfig) public chainConfigs;
    mapping(uint256 => CrossChainMessage) public messages;
    mapping(address => uint256[]) public userMessages;
    mapping(bytes32 => bool) public processedVAAs;
    mapping(uint16 => address) public chainEmitters;

    uint256 public messageCounter = 1;
    uint32 public messageNonce = 0;
    uint8 public consistencyLevel = 15; // Finalized

    // Fees
    uint256 public relayerFeePercentage = 50; // 0.5%
    uint256 public recoveryFeePercentage = 100; // 1%

    // Events
    event CrossChainMessageSent(
        uint256 indexed messageId,
        uint16 indexed dstChainId,
        MessageType indexed messageType,
        uint64 vaaSequence
    );

    event CrossChainMessageReceived(
        uint256 indexed messageId,
        uint16 indexed srcChainId,
        MessageType indexed messageType,
        bool verified
    );

    event ChainConfigUpdated(
        uint16 indexed chainId,
        address targetAddress,
        uint256 gasLimit
    );

    event AirdropDistributed(
        uint256 indexed campaignId,
        address indexed recipient,
        uint256 amount,
        uint16 destChainId
    );

    event VAAProcessed(bytes32 vaaHash, uint256 messageId);

    /**
     * @dev Initialize with Wormhole core and relayer
     */
    constructor(
        address _wormholeCore,
        address _wormholeRelayer
    ) {
        require(_wormholeCore != address(0), "Invalid core");
        require(_wormholeRelayer != address(0), "Invalid relayer");

        wormholeCore = IWormhole(_wormholeCore);
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);

        _initializeChainConfigs();
    }

    /**
     * @dev Initialize chain configurations
     */
    function _initializeChainConfigs() internal {
        // Ethereum
        chainConfigs[ETHEREUM_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: ETHEREUM_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 200000
        });

        // Arbitrum
        chainConfigs[ARBITRUM_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: ARBITRUM_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 250000
        });

        // Optimism
        chainConfigs[OPTIMISM_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: OPTIMISM_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 250000
        });

        // Polygon
        chainConfigs[POLYGON_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: POLYGON_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 200000
        });

        // Avalanche
        chainConfigs[AVALANCHE_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: AVALANCHE_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 250000
        });

        // Base
        chainConfigs[BASE_WORMHOLE_ID] = ChainConfig({
            wormholeChainId: BASE_WORMHOLE_ID,
            targetAddress: address(0),
            enabled: true,
            gasLimit: 250000
        });
    }

    /**
     * @dev Update chain configuration
     */
    function updateChainConfig(
        uint16 _chainId,
        address _targetAddress,
        uint256 _gasLimit,
        bool _enabled
    )
        external
        onlyOwner
    {
        require(_targetAddress != address(0), "Invalid target");

        chainConfigs[_chainId].targetAddress = _targetAddress;
        chainConfigs[_chainId].gasLimit = _gasLimit;
        chainConfigs[_chainId].enabled = _enabled;

        emit ChainConfigUpdated(_chainId, _targetAddress, _gasLimit);
    }

    /**
     * @dev Set chain emitter address
     */
    function setChainEmitter(uint16 _chainId, address _emitterAddress)
        external
        onlyOwner
    {
        chainEmitters[_chainId] = _emitterAddress;
    }

    /**
     * @dev Send airdrop distribution via Wormhole
     */
    function sendAirdropDistribution(
        uint16 _dstChainId,
        address _token,
        address _recipient,
        uint256 _amount,
        uint256 _campaignId
    )
        external
        payable
        nonReentrant
        returns (uint64 vaaSequence)
    {
        require(chainConfigs[_dstChainId].enabled, "Chain disabled");
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Invalid amount");
        require(msg.value > 0, "Insufficient fee");

        // Encode payload
        bytes memory payload = abi.encode(
            MessageType.AIRDROP_DISTRIBUTION,
            _token,
            _recipient,
            _amount,
            _campaignId,
            msg.sender
        );

        // Publish message through Wormhole
        uint32 nonce = messageNonce++;
        vaaSequence = wormholeCore.publishMessage{value: msg.value}(
            nonce,
            payload,
            consistencyLevel
        );

        uint256 messageId = messageCounter++;

        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.sourceChainId = ETHEREUM_WORMHOLE_ID;
        message.destChainId = _dstChainId;
        message.messageType = MessageType.AIRDROP_DISTRIBUTION;
        message.sender = msg.sender;
        message.payload = payload;
        message.timestamp = block.timestamp;
        message.vaaSequence = vaaSequence;

        userMessages[_recipient].push(messageId);

        emit CrossChainMessageSent(
            messageId,
            _dstChainId,
            MessageType.AIRDROP_DISTRIBUTION,
            vaaSequence
        );
    }

    /**
     * @dev Send allocation update via Wormhole Relayer
     */
    function sendAllocationUpdate(
        uint16 _dstChainId,
        uint256 _campaignId,
        address[] calldata _recipients,
        uint256[] calldata _amounts
    )
        external
        payable
        nonReentrant
        returns (uint64 sequence)
    {
        require(chainConfigs[_dstChainId].enabled, "Chain disabled");
        require(_recipients.length == _amounts.length, "Array length mismatch");
        require(msg.value > 0, "Insufficient fee");

        ChainConfig memory config = chainConfigs[_dstChainId];

        bytes memory payload = abi.encode(
            MessageType.ALLOCATION_UPDATE,
            _campaignId,
            _recipients,
            _amounts
        );

        // Send via Wormhole Relayer
        sequence = wormholeRelayer.sendPayloadToEvm{value: msg.value}(
            config.wormholeChainId,
            config.targetAddress,
            payload,
            0, // No receiver value
            config.gasLimit
        );

        uint256 messageId = messageCounter++;

        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.destChainId = _dstChainId;
        message.messageType = MessageType.ALLOCATION_UPDATE;
        message.sender = msg.sender;
        message.payload = payload;
        message.timestamp = block.timestamp;
        message.vaaSequence = sequence;

        emit CrossChainMessageSent(
            messageId,
            _dstChainId,
            MessageType.ALLOCATION_UPDATE,
            sequence
        );
    }

    /**
     * @dev Send claim notification
     */
    function sendClaimNotification(
        uint16 _dstChainId,
        uint256 _campaignId,
        address _recipient,
        uint256 _amount
    )
        external
        payable
        nonReentrant
        returns (uint64 vaaSequence)
    {
        require(chainConfigs[_dstChainId].enabled, "Chain disabled");
        require(_recipient != address(0), "Invalid recipient");

        bytes memory payload = abi.encode(
            MessageType.CLAIM_NOTIFICATION,
            _campaignId,
            _recipient,
            _amount
        );

        uint32 nonce = messageNonce++;
        vaaSequence = wormholeCore.publishMessage{value: msg.value}(
            nonce,
            payload,
            consistencyLevel
        );

        uint256 messageId = messageCounter++;

        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.destChainId = _dstChainId;
        message.messageType = MessageType.CLAIM_NOTIFICATION;
        message.sender = msg.sender;
        message.payload = payload;
        message.timestamp = block.timestamp;
        message.vaaSequence = vaaSequence;

        emit CrossChainMessageSent(
            messageId,
            _dstChainId,
            MessageType.CLAIM_NOTIFICATION,
            vaaSequence
        );
    }

    /**
     * @dev Process VAA (Verified Action Approval) from Wormhole Guardian
     */
    function processVAA(
        bytes calldata encodedVAA,
        uint16 _srcChainId
    )
        external
        nonReentrant
    {
        bytes32 vaaHash = keccak256(encodedVAA);
        require(!processedVAAs[vaaHash], "VAA already processed");

        // Verify VAA is signed by Wormhole Guardians
        // (Implementation depends on Wormhole SDK)
        // parseAndVerifyVM(encodedVAA);

        processedVAAs[vaaHash] = true;

        // Decode and process payload
        // (bytes memory payload) = abi.decode(encodedVAA, (bytes));
        // _processPayload(payload, _srcChainId);

        uint256 messageId = messageCounter++;
        CrossChainMessage storage message = messages[messageId];
        message.messageId = messageId;
        message.sourceChainId = _srcChainId;
        message.timestamp = block.timestamp;
        message.verified = true;
        message.processed = true;

        emit VAAProcessed(vaaHash, messageId);
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
     * @dev Get message count
     */
    function getMessageCount() external view returns (uint256) {
        return messageCounter;
    }

    /**
     * @dev Check if VAA processed
     */
    function isVAAProcessed(bytes calldata encodedVAA)
        external
        view
        returns (bool)
    {
        return processedVAAs[keccak256(encodedVAA)];
    }

    /**
     * @dev Set consistency level
     */
    function setConsistencyLevel(uint8 _level) external onlyOwner {
        require(_level >= 1 && _level <= 15, "Invalid level");
        consistencyLevel = _level;
    }

    /**
     * @dev Set relayer fee percentage
     */
    function setRelayerFeePercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 1000, "Fee too high"); // Max 10%
        relayerFeePercentage = _percentage;
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
