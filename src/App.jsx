import React, { useState, useEffect } from 'react';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';

const MinimalCardWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [network, setNetwork] = useState('SOL'); 
  const [printMode, setPrintMode] = useState(null); // 'card' or 'thermal'

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

      setWallet({ mnemonic, publicKey, date: new Date().toLocaleString() });
    } catch (error) {
      console.error("Error generating wallet:", error);
    }
  };

  // Trigger print when mode changes
  useEffect(() => {
    if (printMode) {
      setTimeout(() => {
        window.print();
        // Optional: Reset mode after print dialog closes (browser dependent behavior)
        // setPrintMode(null); 
      }, 100);
    }
  }, [printMode]);

  // Cancel print mode to return to UI
  useEffect(() => {
    const handleAfterPrint = () => setPrintMode(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  return (
    <div className={`min-h-screen bg-gray-100 flex flex-col items-center py-10 font-sans 
      ${printMode === 'thermal' ? 'print:bg-white print:p-0' : 'print:bg-white'}`}>
      
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
          Generate Wallet
        </button>

        {wallet && (
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setPrintMode('card')}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2 rounded-lg hover:border-gray-400 transition-colors text-sm"
            >
              Print Card
            </button>
            <button 
              onClick={() => setPrintMode('thermal')}
              className="flex-1 border-2 border-black bg-gray-50 text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <span>🖨️ Receipt</span>
            </button>
          </div>
        )}
      </div>

      {/* --- DISPLAY LOGIC --- */}
      
      {/* 1. STANDARD CARD VIEW (Visible on Screen & 'card' Print Mode) */}
      <div 
        className={`relative bg-white text-black shadow-2xl overflow-hidden flex flex-col items-center justify-between px-6 py-8 transition-all
        ${!wallet ? 'opacity-50 blur-sm' : 'opacity-100'}
        ${printMode === 'thermal' ? 'hidden' : 'flex'} 
        print:shadow-none`}
        style={{ 
          width: '350px', 
          height: '600px', 
          border: wallet ? `1px solid #e5e7eb` : 'none'
        }}
      >
        <div className="flex flex-col items-center w-full mt-6 flex-grow justify-start">
            <QRCodeCanvas value={wallet?.publicKey || "placeholder"} size={260} level={"H"} />
            <p className="font-mono text-[9px] text-gray-400 mt-4 text-center break-all w-full leading-tight select-all px-2">
                {wallet?.publicKey || "------------------------------------------------"}
            </p>
        </div>
        <div className="w-full border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center min-h-[80px] mb-6 bg-gray-50">
            {wallet ? (
                <p className="font-mono text-xs text-center leading-relaxed text-gray-600 break-words font-medium tracking-tight">
                    {wallet.mnemonic}
                </p>
            ) : (
                <span className="text-gray-300 text-[10px] font-mono text-center uppercase tracking-widest">
                    seed phrase area
                </span>
            )}
        </div>
        <div className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-200">
            {network}
        </div>
      </div>

      {/* 2. THERMAL RECEIPT LAYOUT (Visible ONLY in 'thermal' Print Mode) */}
      {printMode === 'thermal' && wallet && (
        <div className="bg-white w-[80mm] p-2 flex flex-col items-center text-black font-mono text-xs leading-tight">
          
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="font-black text-xl mb-1 uppercase">Paper Wallet</h1>
            <p className="text-[10px] uppercase">COLD STORAGE RECEIPT</p>
            <p className="text-[10px]">{wallet.date}</p>
          </div>

          <div className="w-full border-b-2 border-black border-dashed my-2"></div>

          {/* Network Info */}
          <div className="w-full flex justify-between font-bold mb-2">
            <span>NETWORK:</span>
            <span>{network}</span>
          </div>

          <div className="w-full border-b border-black border-dashed my-2"></div>

          {/* Public Key */}
          <div className="w-full text-center mb-2">
            <span className="font-bold block mb-1">PUBLIC ADDRESS</span>
            <div className="flex justify-center my-2 p-1 bg-white">
               <QRCodeCanvas value={wallet.publicKey} size={180} level={"M"} includeMargin={false} />
            </div>
            <p className="break-all text-[10px] text-center">{wallet.publicKey}</p>
          </div>

          <div className="w-full border-b border-black border-dashed my-4"></div>

          {/* Private Key / Seed */}
          <div className="w-full text-center mb-4">
            <span className="font-bold block mb-2 text-sm">⚠️ SECRET PHRASE ⚠️</span>
            <p className="text-center font-bold uppercase text-sm leading-relaxed break-words px-2">
              {wallet.mnemonic}
            </p>
          </div>

          <div className="w-full border-b-2 border-black border-dashed my-2"></div>

          {/* Footer */}
          <p className="text-[10px] text-center mt-2 uppercase">
            Keep safe. Not financial advice.<br/>
            Do not share this slip.
          </p>
          <br /><br />
          <p className="text-center text-[8px]">. . . . . . . . . . . . . . .</p>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background-color: white; -webkit-print-color-adjust: exact; }
          /* Hide everything by default in print, we will selectively show */
          body > * { display: none; }
          #root, #root > div { display: block !important; height: auto; }
          
          /* If Thermal Mode, force receipt styles */
          ${printMode === 'thermal' ? `
            @page { size: 80mm auto; margin: 0mm; } 
            body { width: 80mm; }
          ` : ''}
        }
      `}</style>
    </div>
  );
};

export default MinimalCardWallet;
