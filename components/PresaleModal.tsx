'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWalletStore } from '@/lib/wallet-store';
import { PresaleService } from '@/lib/presale-service';
import { PRESALE_CONSTANTS, CURRENT_PRESALE } from '@/lib/presale-config';
import { ethers } from 'ethers';

interface PresaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresaleModal({ isOpen, onClose }: PresaleModalProps) {
  const { wallet, address, currentChain } = useWalletStore();
  const [contributionAmount, setContributionAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Presale stats from contract
  const [presaleInfo, setPresaleInfo] = useState({
    totalRaised: 0,
    hardCap: PRESALE_CONSTANTS.hardCap,
    participants: 0,
    timeRemaining: 0,
    tokenPrice: PRESALE_CONSTANTS.tokenPrice,
    minContribution: PRESALE_CONSTANTS.minContribution,
    maxContribution: PRESALE_CONSTANTS.maxContribution,
    active: false,
    finalized: false,
  });

  const [userInfo, setUserInfo] = useState({
    contribution: 0,
    tokenAllocation: 0,
    hasClaimed: false,
  });

  const progress = (presaleInfo.totalRaised / presaleInfo.hardCap) * 100;
  const tokensYouGet = parseFloat(contributionAmount || '0') / presaleInfo.tokenPrice;
  
  // Determine presale status
  const isPresaleActive = presaleInfo.active && !presaleInfo.finalized && presaleInfo.timeRemaining > 0;
  const isPresaleEnded = !presaleInfo.active || presaleInfo.finalized || presaleInfo.timeRemaining <= 0;

  // Load presale data when modal opens
  useEffect(() => {
    if (isOpen && wallet && address) {
      loadPresaleData();
    }
  }, [isOpen, wallet, address]);

  const loadPresaleData = async () => {
    if (!wallet || !CURRENT_PRESALE.presaleAddress) {
      setError('Presale not configured. Please deploy contracts first.');
      return;
    }

    setIsLoading(true);
    
    try {
      const presaleService = new PresaleService(wallet);
      
      // Verify correct network
      const isCorrectNetwork = await presaleService.verifyNetwork();
      if (!isCorrectNetwork) {
        setError(`Please switch to ${CURRENT_PRESALE.chainId === 97 ? 'BSC Testnet' : 'BSC Mainnet'}`);
        setIsLoading(false);
        return;
      }
      
      // Load presale info
      const info = await presaleService.getPresaleInfo();
      
      console.log('🔍 Presale info from service:', {
        raised: info.raised,
        participants: info.participantCount,
        timeRemaining: info.timeRemaining,
        active: info.active,
        finalized: info.finalized,
      });
      
      setPresaleInfo({
        ...presaleInfo,
        totalRaised: info.raised,
        participants: info.participantCount,
        timeRemaining: info.timeRemaining,
        active: info.active,
        finalized: info.finalized,
      });
      
      // Load user info
      if (address) {
        const userInfoData = await presaleService.getUserInfo(address);
        setUserInfo(userInfoData);
      }
      
      setError('');
    } catch (err: any) {
      console.error('Error loading presale data:', err);
      if (err.message.includes('not configured')) {
        setError('Presale not deployed yet. Check back soon!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!wallet || !contributionAmount) return;
    
    const amount = parseFloat(contributionAmount);
    if (amount < presaleInfo.minContribution) {
      setError(`Minimum contribution is $${presaleInfo.minContribution}`);
      return;
    }
    
    if (amount > presaleInfo.maxContribution) {
      setError(`Maximum contribution is $${presaleInfo.maxContribution}`);
      return;
    }

    setIsContributing(true);
    setError('');
    setSuccess('');

    try {
      const presaleService = new PresaleService(wallet);
      
      // Contribute
      const txHash = await presaleService.contribute(amount);
      
      setSuccess(`Success! You will receive ${tokensYouGet.toLocaleString()} BLAZE after TGE. Tx: ${txHash.slice(0, 10)}...`);
      setContributionAmount('');
      
      // Reload data
      await loadPresaleData();
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsContributing(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!wallet) return;
    
    setIsContributing(true);
    setError('');
    
    try {
      const presaleService = new PresaleService(wallet);
      const txHash = await presaleService.claimTokens();
      
      setSuccess(`Tokens claimed successfully! Tx: ${txHash.slice(0, 10)}...`);
      await loadPresaleData();
      
    } catch (err: any) {
      setError(err.message || 'Claim failed');
    } finally {
      setIsContributing(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days}d ${hours}h`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-soft-xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-orange-500" />
                    BLAZE Token Presale
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Join the early supporters - 2.4x gain at launch!</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Progress */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Raised</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${presaleInfo.totalRaised.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Hard Cap</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${presaleInfo.hardCap.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-yellow-500"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{progress.toFixed(1)}% Complete</span>
                    <span>${(presaleInfo.hardCap - presaleInfo.totalRaised).toLocaleString()} remaining</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <Users className="w-5 h-5 text-blue-500 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{presaleInfo.participants}</div>
                    <div className="text-xs text-gray-600">Participants</div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">2.4x</div>
                    <div className="text-xs text-gray-600">Launch Gain</div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <Clock className="w-5 h-5 text-orange-500 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formatTimeRemaining(presaleInfo.timeRemaining)}</div>
                    <div className="text-xs text-gray-600">Time Left</div>
                  </div>
                </div>

                {/* Your Contribution */}
                {userInfo.contribution > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                      <CheckCircle className="w-5 h-5" />
                      Your Contribution
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Contributed</div>
                        <div className="text-lg font-bold text-gray-900">${userInfo.contribution.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tokens Allocated</div>
                        <div className="text-lg font-bold text-gray-900">{userInfo.tokenAllocation.toLocaleString()} BLAZE</div>
                      </div>
                    </div>
                    
                    {/* Claim Button (only if finalized and not claimed) */}
                    {presaleInfo.finalized && !userInfo.hasClaimed && (
                      <button
                        onClick={handleClaimTokens}
                        disabled={isContributing}
                        className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
                      >
                        {isContributing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Claim Your Tokens
                          </>
                        )}
                      </button>
                    )}
                    
                    {userInfo.hasClaimed && (
                      <div className="mt-4 text-center text-sm text-green-700 font-semibold">
                        ✅ Tokens Claimed!
                      </div>
                    )}
                  </div>
                )}

                {/* Contribution Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Contribution Amount (USD in BNB)
                    </label>
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder={`Min: $${presaleInfo.minContribution} - Max: $${presaleInfo.maxContribution}`}
                      className="input-field"
                      disabled={isContributing}
                    />
                    <div className="text-xs text-gray-600 mt-1">
                      Min: ${presaleInfo.minContribution} | Max: ${presaleInfo.maxContribution} per wallet
                    </div>
                  </div>

                  {contributionAmount && parseFloat(contributionAmount) > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">You will receive</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {tokensYouGet.toLocaleString()} BLAZE
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Presale Price:</span>
                          <span className="font-semibold">${presaleInfo.tokenPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Launch Price:</span>
                          <span className="font-semibold">$0.01</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Your Profit at Launch:</span>
                          <span>+140% (${(tokensYouGet * (0.01 - presaleInfo.tokenPrice)).toFixed(2)})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-rose-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}

                  {/* Show contribute button only if presale is active */}
                  {isPresaleActive && (
                    <button
                      onClick={handleContribute}
                      disabled={isContributing || !contributionAmount || parseFloat(contributionAmount) < presaleInfo.minContribution}
                      className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                    {isContributing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Contributing...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Contribute Now
                      </>
                    )}
                    </button>
                  )}
                  
                  {/* Show message if presale ended */}
                  {isPresaleEnded && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                      <p className="text-sm text-yellow-700 font-semibold">
                        ⏰ Presale has ended. Waiting for finalization...
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Active: {presaleInfo.active.toString()}, Time: {presaleInfo.timeRemaining}ms
                      </p>
                    </div>
                  )}
                  
                  {/* Show loading state */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Fund Allocation */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Fund Allocation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Liquidity (Locked)</span>
                      <span className="font-semibold text-gray-900">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operational Budget</span>
                      <span className="font-semibold text-gray-900">40%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                      *Operational: Team salaries, development, marketing, exchange listings
                    </div>
                  </div>
                </div>

                {/* Key Info */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Why Join the Presale?</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>2.4x instant gain at launch ($0.00417 → $0.01)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>60% of funds locked in liquidity for 6 months</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Early access to revolutionary wallet features</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Founding member benefits & exclusive perks</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

