import React, { useState } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { QRCodeCanvas } from 'qrcode.react';

// Note: Ensure you have added the polyfills in your main.jsx or vite.config.js
// as described in the instructions above for this to work.

const SolanaWalletGenerator = () => {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateWallet = async () => {
    try {
      // Generate a 12-word mnemonic
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      
      // Phantom Wallet derivation path (Solana standard)
      const path = "m/44'/501'/0'/0'";
      const derivedSeed = derivePath(path, seed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedSeed);

      setWallet({
        mnemonic: mnemonic,
        publicKey: keypair.publicKey.toBase58(),
      });
      setCopied(false);
    } catch (error) {
      console.error("Error generating wallet:", error);
      alert("Error generating wallet. Check console for details (often polyfill issues).");
    }
  };

  const copyToClipboard = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-purple-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Solana Wallet Gen</h2>
          <p className="text-purple-100 text-sm">Phantom Compatible</p>
        </div>

        <div className="p-6">
          <button 
            onClick={generateWallet}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md mb-8 flex items-center justify-center gap-2"
          >
            Generate New Wallet
          </button>

          {wallet && (
            <div className="space-y-8 animate-fade-in-up">
              
              {/* QR Code Section */}
              <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
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
                  <p className="text-xs font-mono text-gray-600 break-all bg-gray-100 p-2 rounded select-all cursor-text">
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
                    className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                  >
                    {copied ? 'Copied!' : 'Copy Phrase'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {wallet.mnemonic.split(' ').map((word, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-red-100 p-2 rounded-md text-center shadow-sm"
                    >
                      <span className="text-[10px] text-gray-400 block mb-0.5">{index + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{word}</span>
                    </div>
                  ))}
                </div>

                <p className="text-center text-red-500 text-xs mt-4 font-medium">
                  ⚠️ Never share this phrase. It controls your funds.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolanaWalletGenerator;
