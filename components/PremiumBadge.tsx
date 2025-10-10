'use client';

import { Crown, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBadgeProps {
  isPremium: boolean;
  tokenBalance?: number;
  threshold?: number;
}

export default function PremiumBadge({ isPremium, tokenBalance = 0, threshold = 10000 }: PremiumBadgeProps) {
  if (!isPremium && tokenBalance < threshold) return null;

  const progress = Math.min((tokenBalance / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      className="relative"
    >
      {isPremium ? (
        // Premium Active Badge
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(251, 146, 60, 0.5)',
                '0 0 40px rgba(251, 146, 60, 0.8)',
                '0 0 20px rgba(251, 146, 60, 0.5)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full p-2"
          >
            <Crown className="w-5 h-5 text-white" />
          </motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-1 rounded-full border-2 border-dashed border-orange-400/50"
          />
        </div>
      ) : (
        // Progress to Premium
        <div className="relative group">
          <div className="bg-slate-800 rounded-full p-2 border-2 border-orange-500/50">
            <Crown className="w-5 h-5 text-orange-400" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 whitespace-nowrap shadow-xl">
              <div className="text-sm font-semibold mb-1">Premium Progress</div>
              <div className="text-xs text-slate-400 mb-2">
                {tokenBalance.toLocaleString()} / {threshold.toLocaleString()} BLAZE
              </div>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                />
              </div>
              <div className="text-xs text-orange-400 mt-1">
                {(100 - progress).toFixed(0)}% to go!
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function PremiumCard({ isPremium, onUpgrade }: { isPremium: boolean; onUpgrade: () => void }) {
  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/50 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-400">Premium Member</h3>
            <p className="text-sm text-slate-400">Lifetime access unlocked</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>0% swap fees (save hundreds!)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Priority customer support</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Exclusive launchpad access</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span>Advanced analytics dashboard</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Upgrade to Premium</h3>
          <p className="text-sm text-slate-400">Hold 10,000 BLAZE to unlock</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Zap className="w-4 h-4" />
          <span>0% swap fees forever</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Star className="w-4 h-4" />
          <span>All premium features</span>
        </div>
      </div>

      <button
        onClick={onUpgrade}
        className="w-full py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl font-semibold transition-all"
      >
        Stake to Unlock Premium
      </button>
    </motion.div>
  );
}
