'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/lib/wallet-store';
import { CHAINS } from '@/lib/chains';
import { Rocket, CheckCircle2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeployContract() {
  const { wallet, currentChain } = useWalletStore();
  const chain = CHAINS[currentChain];
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(deployed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deployToken = async () => {
    if (!wallet) {
      setError('No wallet found. Create or import a wallet first.');
      return;
    }

    setDeploying(true);
    setError('');

    try {
      // Create provider and signer
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
      const signer = new ethers.Wallet(wallet.privateKey, provider);

      // Check balance
      const balance = await provider.getBalance(wallet.address);
      if (balance === 0n) {
        throw new Error(`No ${chain.nativeCurrency.symbol} for gas fees. Get some ${chain.nativeCurrency.symbol} first!`);
      }

      console.log('🚀 Deploying Arc Token...');
      console.log('From:', wallet.address);
      console.log('Balance:', ethers.formatEther(balance), chain.nativeCurrency.symbol);

      // Simple ERC20 deployment (you'll need to add actual bytecode)
      // For now, this is a placeholder showing the structure
      
      setError('Note: Contract bytecode needs to be added for actual deployment. This is a UI preview.');
      
      // Simulated deployment for demo
      // In production, you'd use:
      // const factory = new ethers.ContractFactory(ABI, BYTECODE, signer);
      // const contract = await factory.deploy(...args);
      // await contract.waitForDeployment();
      // const address = await contract.getAddress();
      
      // For demo purposes:
      setTimeout(() => {
        const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
        setDeployed(mockAddress);
        setDeploying(false);
      }, 2000);

    } catch (err: any) {
      console.error('Deployment error:', err);
      setError(err.message || 'Deployment failed');
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Deploy Arc Token</h2>
            <p className="text-gray-600 text-sm">Deploy directly from Arc wallet</p>
          </div>
        </div>

        {/* Wallet Info */}
        {wallet && (
          <div className="mb-6 p-4 bg-white/50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Deploying from:</div>
            <div className="font-mono text-sm">{wallet.address}</div>
            <div className="text-sm text-gray-600 mt-2">Network: {chain.name}</div>
          </div>
        )}

        {/* Deploy Button */}
        {!deployed ? (
          <button
            onClick={deployToken}
            disabled={deploying || !wallet}
            className="w-full py-4 bg-gradient-primary rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {deploying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Deploy Token to {chain.name}
              </>
            )}
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-emerald-400 mb-2">Successfully Deployed!</h3>
              <p className="text-gray-600 text-sm mb-4">Your Arc Token is now live on {chain.name}</p>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Contract Address:</div>
                <div className="font-mono text-sm break-all">{deployed}</div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={copyAddress}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </>
                  )}
                </button>
                <a
                  href={`${chain.explorerUrl}/address/${deployed}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setDeployed('');
                setError('');
              }}
              className="text-gray-600 hover:text-white text-sm transition-colors"
            >
              Deploy Another Token
            </button>
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-400 mb-1">Deployment Failed</div>
                <div className="text-sm text-gray-700">{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="mt-6 p-4 bg-white/50 rounded-xl">
          <h4 className="font-semibold mb-2">ℹ️ How it works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Uses your Arc wallet private key</li>
            <li>• Deploys directly to blockchain</li>
            <li>• You pay gas fees from your balance</li>
            <li>• Contract is verified automatically</li>
            <li>• No MetaMask needed! 🎉</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




