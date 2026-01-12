import React, { useState } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';

// Note: Ensure polyfills (Buffer, etc.) are configured in vite.config.js for bip39 to work.

const CryptoWalletGenerator = () => {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState('SOL'); // Options: 'SOL' or 'ETH'

  // Theme configuration based on network
  const theme = {
    SOL: {
      name: 'Solana',
      bg: 'bg-purple-600',
      bgHover: 'hover:bg-purple-700',
      lightBg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      icon: '◎'
    },
    ETH: {
      name: 'Ethereum',
      bg: 'bg-blue-600',
      bgHover: 'hover:bg-blue-700',
      lightBg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      icon: 'Ξ'
    }
  };

  const currentTheme = theme[network];

  const generateWallet = async () => {
    try {
      // 1. Generate Mnemonic (BIP39) - Common for both
      const mnemonic = bip39.generateMnemonic();
      
      let publicKey = '';

      if (network === 'SOL') {
        // --- SOLANA GENERATION ---
        const seed = await bip39.mnemonicToSeed(mnemonic);
        // Phantom/Solana standard path
        const path = "m/44'/501'/0'/0'"; 
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedSeed);
        publicKey = keypair.publicKey.toBase58();
      } else {
        // --- ETHEREUM GENERATION ---
        // Ethers.js handles BIP39 and standard ETH path (m/44'/60'/0'/0/0) automatically
        const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
        publicKey = ethWallet.address;
      }

      setWallet({
        mnemonic,
        publicKey,
        network
      });
      setCopied(false);
    } catch (error) {
      console.error("Error generating wallet:", error);
      alert(`Error generating ${network} wallet. Check console.`);
    }
  };

  const copyToClipboard = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNetworkChange = (net) => {
    setNetwork(net);
    setWallet(null); // Clear previous wallet when switching
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-colors duration-300">
        
        {/* Header with Toggle */}
        <div className={`${currentTheme.bg} p-6 text-center transition-colors duration-300`}>
          <div className="flex justify-center gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-sm w-fit mx-auto mb-4">
            <button
              onClick={() => handleNetworkChange('SOL')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                network === 'SOL' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-100 hover:bg-white/10'
              }`}
            >
              SOLANA
            </button>
            <button
              onClick={() => handleNetworkChange('ETH')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                network === 'ETH' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              ETHEREUM
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
            <span>{currentTheme.icon}</span> {currentTheme.name} Gen
          </h2>
          <p className="text-white/80 text-xs">
            {network === 'SOL' ? 'Phantom Compatible' : 'Metamask Compatible'}
          </p>
        </div>

        <div className="p-6">
          <button 
            onClick={generateWallet}
            className={`w-full ${currentTheme.bg} ${currentTheme.bgHover} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md mb-8 flex items-center justify-center gap-2`}
          >
            Generate New {network} Wallet
          </button>

          {wallet && (
            <div className="space-y-8 animate-fade-in-up">
              
              {/* QR Code Section */}
              <div className={`flex flex-col items-center p-6 ${currentTheme.lightBg} rounded-xl border ${currentTheme.border} border-dashed transition-colors duration-300`}>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeCanvas 
                    value={wallet.publicKey} 
                    size={160}
                    level={"H"}
                  />
                </div>
                <div className="mt-4 text-center w-full">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Public Address
                  </p>
                  <p className="text-xs font-mono text-gray-600 break-all bg-white border border-gray-100 p-2 rounded select-all cursor-text shadow-sm">
                    {wallet.publicKey}
                  </p>
                </div>
              </div>

              {/* Mnemonic Section */}
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-red-800 font-bold text-sm flex items-center gap-2">
                    <span className="text-lg">🔐</span> Secret Recovery Phrase
                  </h3>
                  <button 
                    onClick={copyToClipboard}
                    className="text-xs text-red-600 hover:text-red-800 font-medium underline transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy Phrase'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {wallet.mnemonic.split(' ').map((word, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-red-100 p-2 rounded-md text-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="text-[10px] text-gray-400 block mb-0.5">{index + 1}</span>
                      <span className="text-sm font-medium text-gray-800 select-all">{word}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-red-500 text-xs mt-4 font-medium border-t border-red-100 pt-3">
                  ⚠️ This phrase grants full access to your {wallet.network} funds.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoWalletGenerator;
