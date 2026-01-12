import React, { useState, useRef } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';

const BusinessCardWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [network, setNetwork] = useState('SOL'); // 'SOL' or 'ETH'

  // Ref for printing logic if needed
  const cardRef = useRef();

  const theme = {
    SOL: {
      name: 'Solana',
      color: '#9333ea', // Purple-600
      borderColor: 'border-purple-600',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      ticker: 'SOL'
    },
    ETH: {
      name: 'Ethereum',
      color: '#2563eb', // Blue-600
      borderColor: 'border-blue-600',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      ticker: 'ETH'
    }
  };

  const currentTheme = theme[network];

  const generateWallet = async () => {
    try {
      const mnemonic = bip39.generateMnemonic();
      let publicKey = '';

      if (network === 'SOL') {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const path = "m/44'/501'/0'/0'"; 
        const derivedSeed = derivePath(path, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedSeed);
        publicKey = keypair.publicKey.toBase58();
      } else {
        const ethWallet = ethers.Wallet.fromPhrase(mnemonic);
        publicKey = ethWallet.address;
      }

      setWallet({ mnemonic, publicKey });
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 font-sans print:bg-white print:p-0">
      
      {/* --- CONTROLS (Hidden when printing) --- */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 w-full max-w-sm print:hidden">
        <div className="flex gap-2 justify-center bg-gray-100 p-1 rounded-lg">
          {['SOL', 'ETH'].map((net) => (
            <button
              key={net}
              onClick={() => { setNetwork(net); setWallet(null); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                network === net ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {net}
            </button>
          ))}
        </div>
        <button 
          onClick={generateWallet}
          className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Generate New Wallet
        </button>
        {wallet && (
          <button 
            onClick={handlePrint}
            className="w-full border-2 border-gray-200 text-gray-600 font-bold py-2 rounded-lg hover:border-gray-400 transition-colors"
          >
            Print Card
          </button>
        )}
      </div>

      {/* --- THE BUSINESS CARD (Print Area) --- */}
      {/* Aspect Ratio 2:3.5 (Standard Portrait Business Card) */}
      <div 
        ref={cardRef}
        className={`relative bg-white text-black shadow-2xl print:shadow-none overflow-hidden print:w-full print:h-full flex flex-col items-center
        ${!wallet ? 'opacity-50 blur-sm' : 'opacity-100'}`}
        style={{ 
          width: '350px', 
          height: '600px', // Roughly 3.5 x 2 ratio scaled up
          border: wallet ? `1px solid #e5e7eb` : 'none'
        }}
      >
        {/* 1. Header & QR Section (Top ~35%) */}
        <div className="w-full pt-8 pb-4 flex flex-col items-center z-10">
            {/* Header */}
            <div className={`flex items-center gap-2 mb-4 px-4 py-1 rounded-full ${currentTheme.bgLight}`}>
                <span className={`font-bold uppercase tracking-widest text-xs ${currentTheme.textColor}`}>
                    {currentTheme.name} Paper Wallet
                </span>
            </div>

            {/* QR Code */}
            <div className="bg-white p-2 rounded-xl border-2 border-gray-100">
                <QRCodeCanvas 
                    value={wallet?.publicKey || "placeholder"} 
                    size={180} // Large QR
                    level={"H"}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                />
            </div>
            
            {/* Public Address Label */}
            <div className="mt-4 px-8 text-center w-full">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">
                    Deposit Address (Public)
                </p>
                <p className="font-mono text-[11px] leading-tight break-all text-center text-gray-600">
                    {wallet?.publicKey || "Generate a wallet to see address"}
                </p>
            </div>
        </div>

        {/* Divider */}
        <div className="w-4/5 h-px bg-gray-100 my-2"></div>

        {/* 2. Mnemonic Section (Majority ~65%) */}
        <div className="flex-1 w-full px-8 pb-8 flex flex-col justify-center bg-white">
            <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xl">🔐</span>
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-800">
                    Private Key Phrase
                </h3>
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
                {wallet ? (
                    wallet.mnemonic.split(' ').map((word, index) => (
                        <div key={index} className="flex items-end border-b border-gray-200 pb-1">
                            <span className="text-[10px] text-gray-400 w-6 font-mono select-none">
                                {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <span className={`flex-1 text-sm font-bold font-mono ${currentTheme.textColor}`}>
                                {word}
                            </span>
                        </div>
                    ))
                ) : (
                    // Skeleton loader for visual layout
                    Array(12).fill(0).map((_, i) => (
                        <div key={i} className="flex items-end border-b border-gray-100 pb-1">
                            <span className="text-[10px] text-gray-300 w-6">{(i+1).toString().padStart(2, '0')}</span>
                            <div className="h-4 bg-gray-100 w-full rounded-sm"></div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Warning */}
            <div className="mt-auto pt-6 text-center">
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">
                    Keep this card safe • Do not share
                </p>
            </div>
        </div>
        
        {/* Decorative Top Border */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${network === 'SOL' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
      </div>
      
      {/* Instructions visible only on screen */}
      {!wallet && (
        <p className="mt-4 text-gray-400 text-sm print:hidden">
            Select a network and click Generate
        </p>
      )}

      {/* CSS for printing cleanliness */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact;
          }
          /* Hide everything except the card */
          body > * { display: none !important; }
          #root, #root > div { display: flex !important; align-items: center; justify-content: center; height: 100vh; }
          /* Show the card */
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default BusinessCardWallet;
