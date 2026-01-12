import React, { useState, useRef } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';

const MinimalCardWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [network, setNetwork] = useState('SOL'); 

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
      
      {/* --- CONTROLS (Hidden on Print) --- */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 w-full max-w-sm print:hidden">
        <div className="flex gap-2 justify-center bg-gray-50 p-1 rounded-lg">
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
          Generate
        </button>
        {wallet && (
          <button 
            onClick={handlePrint}
            className="w-full border-2 border-gray-200 text-gray-600 font-bold py-2 rounded-lg hover:border-gray-400 transition-colors"
          >
            Print
          </button>
        )}
      </div>

      {/* --- THE CARD --- */}
      <div 
        className={`relative bg-white text-black shadow-2xl print:shadow-none overflow-hidden flex flex-col items-center justify-between px-8 py-10
        ${!wallet ? 'opacity-50 blur-sm' : 'opacity-100'}`}
        style={{ 
          width: '350px', 
          height: '600px', 
          border: wallet ? `1px solid #e5e7eb` : 'none'
        }}
      >
        {/* Top: QR & Address */}
        <div className="flex flex-col items-center w-full mt-4">
            <QRCodeCanvas 
                value={wallet?.publicKey || "placeholder"} 
                size={220}
                level={"H"}
            />
            
            <p className="font-mono text-[10px] text-gray-500 mt-6 text-center break-all w-full leading-relaxed select-all">
                {wallet?.publicKey || "------------------------------------------------"}
            </p>
        </div>

        {/* Bottom: The Dotted Box (Raw Text) */}
        <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center min-h-[140px] mb-8">
            {wallet ? (
                <p className="font-mono text-lg text-center leading-relaxed text-gray-800 break-words font-medium">
                    {wallet.mnemonic}
                </p>
            ) : (
                <span className="text-gray-300 text-xs font-mono text-center">
                    // RAW SEED //
                </span>
            )}
        </div>

        {/* Tiny Network Indicator (Bottom Right) */}
        <div className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-300">
            {network}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { background-color: white; -webkit-print-color-adjust: exact; }
          body > * { display: none !important; }
          #root, #root > div { display: flex !important; align-items: center; justify-content: center; height: 100vh; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default MinimalCardWallet;
