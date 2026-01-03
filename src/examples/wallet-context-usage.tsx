/**
 * Wallet Context Usage Examples
 * 
 * This file demonstrates how to use the new WalletContext in your components
 */

import { useWalletContext, useWalletState, useWalletActions } from '@/contexts/WalletContext';

/**
 * Example 1: Using the full context
 */
function ExampleFullContext() {
  const { state, actions } = useWalletContext();

  return (
    <div>
      <h2>Wallet Status</h2>
      
      {/* Connection Status */}
      <p>Connected: {state.isConnected ? 'Yes' : 'No'}</p>
      <p>Address: {state.address || 'Not connected'}</p>
      <p>Chain: {state.chain?.name || 'None'}</p>
      <p>Correct Network: {state.isCorrectNetwork ? 'Yes' : 'No'}</p>
      
      {/* Error Display */}
      {state.error && (
        <div className="error">
          <p>{state.error}</p>
          <button onClick={actions.clearError}>Dismiss</button>
        </div>
      )}

      {/* Actions */}
      {!state.isConnected && (
        <button onClick={() => actions.connect()} disabled={state.isConnecting}>
          {state.isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}

      {state.isConnected && !state.isCorrectNetwork && (
        <button onClick={actions.switchToBase}>
          Switch to Base Network
        </button>
      )}

      {state.isConnected && (
        <button onClick={actions.disconnect}>
          Disconnect
        </button>
      )}
    </div>
  );
}

/**
 * Example 2: Using only state (read-only)
 */
function ExampleStateOnly() {
  const state = useWalletState();

  // Useful for display components that don't need to trigger actions
  return (
    <div>
      {state.isConnected && (
        <div className="wallet-info">
          <span>{state.address?.slice(0, 6)}...{state.address?.slice(-4)}</span>
          <span>{state.chain?.name}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Using only actions
 */
function ExampleActionsOnly() {
  const actions = useWalletActions();

  // Useful for action buttons
  return (
    <div>
      <button onClick={() => actions.connect()}>
        Connect
      </button>
      <button onClick={actions.disconnect}>
        Disconnect
      </button>
      <button onClick={actions.switchToBase}>
        Switch to Base
      </button>
    </div>
  );
}

/**
 * Example 4: Conditional rendering based on network
 */
function ExampleConditionalRender() {
  const { state, actions } = useWalletContext();

  // Not connected
  if (!state.isConnected) {
    return (
      <div className="connect-prompt">
        <h3>Please connect your wallet</h3>
        <button onClick={() => actions.connect()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  // Wrong network
  if (!state.isCorrectNetwork) {
    return (
      <div className="network-warning">
        <h3>Wrong Network</h3>
        <p>Please switch to Base network</p>
        <button onClick={actions.switchToBase}>
          Switch to Base
        </button>
      </div>
    );
  }

  // Connected and on correct network
  return (
    <div className="connected">
      <h3>Welcome!</h3>
      <p>Connected: {state.address}</p>
      <p>Network: {state.chain?.name}</p>
      {/* Your app content here */}
    </div>
  );
}

/**
 * Example 5: Checking wallet state in useEffect
 */
function ExampleUseEffect() {
  const { state } = useWalletContext();

  useEffect(() => {
    if (state.isConnected && state.isCorrectNetwork) {
      // Fetch user data, load contracts, etc.
      console.log('Wallet connected and on Base network');
      console.log('Address:', state.address);
      console.log('Chain ID:', state.chain?.id);
    }
  }, [state.isConnected, state.isCorrectNetwork, state.address]);

  return <div>Your component</div>;
}

/**
 * Example 6: Error handling
 */
function ExampleErrorHandling() {
  const { state, actions } = useWalletContext();

  const handleSwitchNetwork = async () => {
    const success = await actions.switchToBase();
    
    if (success) {
      console.log('✅ Successfully switched to Base');
      // Proceed with your logic
    } else {
      console.log('❌ Failed to switch network');
      // Handle error (error will be in state.error)
    }
  };

  return (
    <div>
      {state.error && (
        <div className="error-banner">
          <p>{state.error}</p>
          <button onClick={actions.clearError}>✕</button>
        </div>
      )}
      
      <button onClick={handleSwitchNetwork}>
        Switch Network
      </button>
    </div>
  );
}

/**
 * Example 7: Protected route/component
 */
function ProtectedComponent() {
  const { state, actions } = useWalletContext();

  // Show loading state
  if (state.isConnecting) {
    return <div>Connecting wallet...</div>;
  }

  // Require wallet connection
  if (!state.isConnected) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>Please connect your wallet to access this feature</p>
        <button onClick={() => actions.connect()}>Connect Wallet</button>
      </div>
    );
  }

  // Require Base network
  if (!state.isCorrectNetwork) {
    return (
      <div className="network-required">
        <h2>Wrong Network</h2>
        <p>This feature requires Base network</p>
        <button onClick={actions.switchToBase}>Switch to Base</button>
      </div>
    );
  }

  // User is authenticated and on correct network
  return (
    <div>
      <h2>Protected Content</h2>
      <p>Welcome, {state.address}!</p>
      {/* Your protected content here */}
    </div>
  );
}

export {
  ExampleFullContext,
  ExampleStateOnly,
  ExampleActionsOnly,
  ExampleConditionalRender,
  ExampleUseEffect,
  ExampleErrorHandling,
  ProtectedComponent,
};
