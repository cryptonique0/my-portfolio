// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PriceDiscovery
 * @notice Dynamic pricing mechanism based on demand and supply (bonding curve)
 * @dev Implements automated market maker style price discovery
 */
contract PriceDiscovery is Ownable, ReentrancyGuard {
    
    struct BondingCurve {
        uint256 curveId;
        address tokenA; // Often stablecoin
        address tokenB; // Token being priced
        uint256 reserveA; // Reserve of tokenA
        uint256 reserveB; // Reserve of tokenB
        uint256 currentPrice; // Current price (tokenA per tokenB)
        uint256 initialPrice;
        uint256 maxPrice;
        uint256 minPrice;
        bool active;
    }
    
    struct Trade {
        uint256 curveId;
        address trader;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 price;
        uint256 timestamp;
    }
    
    mapping(uint256 => BondingCurve) public curves;
    mapping(uint256 => Trade[]) public trades;
    
    uint256 public curveCount;
    uint256 public tradeCount;
    
    // Price protection
    uint256 public maxPriceChangePerTx; // e.g., 10 = 10%
    
    event CurveCreated(
        uint256 indexed curveId,
        address tokenA,
        address tokenB,
        uint256 initialPrice
    );
    
    event TokenSwapped(
        uint256 indexed curveId,
        address indexed trader,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 newPrice
    );
    
    event PriceUpdated(uint256 indexed curveId, uint256 newPrice);
    event LiquidityAdded(uint256 indexed curveId, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(uint256 indexed curveId, uint256 amountA, uint256 amountB);
    
    /**
     * @notice Create a new bonding curve
     * @param _tokenA First token (usually stablecoin)
     * @param _tokenB Second token (token being priced)
     * @param _initialReserveA Initial reserve of tokenA
     * @param _initialReserveB Initial reserve of tokenB
     * @param _initialPrice Initial price
     * @param _minPrice Minimum allowed price
     * @param _maxPrice Maximum allowed price
     */
    function createBondingCurve(
        address _tokenA,
        address _tokenB,
        uint256 _initialReserveA,
        uint256 _initialReserveB,
        uint256 _initialPrice,
        uint256 _minPrice,
        uint256 _maxPrice
    ) external onlyOwner returns (uint256) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid tokens");
        require(_tokenA != _tokenB, "Duplicate tokens");
        require(_initialReserveA > 0 && _initialReserveB > 0, "Invalid reserves");
        require(_minPrice <= _initialPrice && _initialPrice <= _maxPrice, "Invalid price");
        
        uint256 curveId = curveCount++;
        
        curves[curveId] = BondingCurve({
            curveId: curveId,
            tokenA: _tokenA,
            tokenB: _tokenB,
            reserveA: _initialReserveA,
            reserveB: _initialReserveB,
            currentPrice: _initialPrice,
            initialPrice: _initialPrice,
            maxPrice: _maxPrice,
            minPrice: _minPrice,
            active: true
        });
        
        emit CurveCreated(curveId, _tokenA, _tokenB, _initialPrice);
        return curveId;
    }
    
    /**
     * @notice Swap tokens along the bonding curve
     * @param _curveId Curve ID
     * @param _tokenIn Input token address
     * @param _amountIn Input amount
     * @param _minAmountOut Minimum output amount (slippage protection)
     */
    function swapTokens(
        uint256 _curveId,
        address _tokenIn,
        uint256 _amountIn,
        uint256 _minAmountOut
    ) external nonReentrant returns (uint256) {
        require(_curveId < curveCount, "Invalid curve");
        require(_amountIn > 0, "Invalid amount");
        
        BondingCurve storage curve = curves[_curveId];
        require(curve.active, "Curve not active");
        
        // Determine swap direction
        bool isBuyingTokenB = _tokenIn == curve.tokenA;
        require(
            isBuyingTokenB || _tokenIn == curve.tokenB,
            "Invalid token"
        );
        
        // Calculate output amount using constant product formula
        uint256 amountOut = _calculateOutputAmount(_curveId, _amountIn, isBuyingTokenB);
        require(amountOut >= _minAmountOut, "Slippage exceeded");
        
        // Update reserves
        if (isBuyingTokenB) {
            curve.reserveA += _amountIn;
            curve.reserveB -= amountOut;
        } else {
            curve.reserveB += _amountIn;
            curve.reserveA -= amountOut;
        }
        
        // Update price
        uint256 newPrice = (curve.reserveA * 1e18) / curve.reserveB;
        require(
            newPrice >= curve.minPrice && newPrice <= curve.maxPrice,
            "Price out of bounds"
        );
        
        curve.currentPrice = newPrice;
        
        // Record trade
        Trade memory trade = Trade({
            curveId: _curveId,
            trader: msg.sender,
            tokenIn: _tokenIn,
            tokenOut: isBuyingTokenB ? curve.tokenB : curve.tokenA,
            amountIn: _amountIn,
            amountOut: amountOut,
            price: newPrice,
            timestamp: block.timestamp
        });
        
        trades[_curveId].push(trade);
        
        // Execute transfer
        require(
            IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn),
            "Input transfer failed"
        );
        
        address outputToken = isBuyingTokenB ? curve.tokenB : curve.tokenA;
        require(
            IERC20(outputToken).transfer(msg.sender, amountOut),
            "Output transfer failed"
        );
        
        emit TokenSwapped(_curveId, msg.sender, _tokenIn, outputToken, _amountIn, amountOut, newPrice);
        
        return amountOut;
    }
    
    /**
     * @notice Add liquidity to curve
     * @param _curveId Curve ID
     * @param _amountA Amount of tokenA
     * @param _amountB Amount of tokenB
     */
    function addLiquidity(
        uint256 _curveId,
        uint256 _amountA,
        uint256 _amountB
    ) external onlyOwner {
        require(_curveId < curveCount, "Invalid curve");
        require(_amountA > 0 && _amountB > 0, "Invalid amounts");
        
        BondingCurve storage curve = curves[_curveId];
        
        curve.reserveA += _amountA;
        curve.reserveB += _amountB;
        
        require(
            IERC20(curve.tokenA).transferFrom(msg.sender, address(this), _amountA),
            "TokenA transfer failed"
        );
        
        require(
            IERC20(curve.tokenB).transferFrom(msg.sender, address(this), _amountB),
            "TokenB transfer failed"
        );
        
        emit LiquidityAdded(_curveId, _amountA, _amountB);
    }
    
    /**
     * @notice Remove liquidity from curve
     * @param _curveId Curve ID
     * @param _amountA Amount of tokenA to remove
     * @param _amountB Amount of tokenB to remove
     */
    function removeLiquidity(
        uint256 _curveId,
        uint256 _amountA,
        uint256 _amountB
    ) external onlyOwner {
        require(_curveId < curveCount, "Invalid curve");
        
        BondingCurve storage curve = curves[_curveId];
        require(curve.reserveA >= _amountA && curve.reserveB >= _amountB, "Insufficient reserves");
        
        curve.reserveA -= _amountA;
        curve.reserveB -= _amountB;
        
        require(IERC20(curve.tokenA).transfer(msg.sender, _amountA), "TokenA transfer failed");
        require(IERC20(curve.tokenB).transfer(msg.sender, _amountB), "TokenB transfer failed");
        
        emit LiquidityRemoved(_curveId, _amountA, _amountB);
    }
    
    /**
     * @notice Get current price
     * @param _curveId Curve ID
     */
    function getCurrentPrice(uint256 _curveId) external view returns (uint256) {
        require(_curveId < curveCount, "Invalid curve");
        return curves[_curveId].currentPrice;
    }
    
    /**
     * @notice Get output amount for input
     * @param _curveId Curve ID
     * @param _amountIn Input amount
     * @param _isBuyingTokenB True if buying tokenB
     */
    function getOutputAmount(
        uint256 _curveId,
        uint256 _amountIn,
        bool _isBuyingTokenB
    ) external view returns (uint256) {
        return _calculateOutputAmount(_curveId, _amountIn, _isBuyingTokenB);
    }
    
    /**
     * @notice Get curve details
     * @param _curveId Curve ID
     */
    function getCurveDetails(uint256 _curveId)
        external
        view
        returns (BondingCurve memory)
    {
        return curves[_curveId];
    }
    
    /**
     * @notice Get trade history
     * @param _curveId Curve ID
     */
    function getTradeHistory(uint256 _curveId)
        external
        view
        returns (Trade[] memory)
    {
        return trades[_curveId];
    }
    
    /**
     * @notice Set max price change per transaction
     * @param _maxChange Maximum price change percentage
     */
    function setMaxPriceChange(uint256 _maxChange) external onlyOwner {
        require(_maxChange > 0 && _maxChange <= 100, "Invalid percentage");
        maxPriceChangePerTx = _maxChange;
    }
    
    /**
     * @notice Deactivate curve
     * @param _curveId Curve ID
     */
    function deactivateCurve(uint256 _curveId) external onlyOwner {
        require(_curveId < curveCount, "Invalid curve");
        curves[_curveId].active = false;
    }
    
    // Internal Functions
    
    function _calculateOutputAmount(
        uint256 _curveId,
        uint256 _amountIn,
        bool _isBuyingTokenB
    ) internal view returns (uint256) {
        BondingCurve memory curve = curves[_curveId];
        
        // Constant product formula: (x + dx) * (y - dy) = x * y
        uint256 reserveIn = _isBuyingTokenB ? curve.reserveA : curve.reserveB;
        uint256 reserveOut = _isBuyingTokenB ? curve.reserveB : curve.reserveA;
        
        uint256 amountInWithFee = (_amountIn * 997) / 1000; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        
        return numerator / denominator;
    }
}
