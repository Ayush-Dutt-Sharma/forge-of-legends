'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ethers } from 'ethers';
import forgeAbi from '@/utils/forgeAbi.json';
import gameLogicAbi from '@/utils/gameLogicAbi.json';

const FORGE_CONTRACT = "0xF0cac17eAca077c718d929e1D409393a005a1434";
const GAME_LOGIC_CONTRACT = "0xe7E8F47A067f13C0934451364f69Bd402cEce99C";

const SEPOLIA_CHAIN_ID = 11155111; // Sepolia Chain ID
const OPENSEA_LINK = "https://testnets.opensea.io/collection/simplenftuploader";

const Home = () => {

  const { address, isConnected, chain } = useAccount();
  const [cooldownActive, setCooldownActive] = useState(false);

  // Fetch ETH Balance
  const { data: balance } = useBalance({ address, chainId: sepolia.id });

  // Fetch Token Balances
  const { data: tokenBalances, refetch } = useReadContract({
    address: GAME_LOGIC_CONTRACT,
    abi: gameLogicAbi,
    functionName: "balanceOfBatch",
    args: [Array(7).fill(address), [0, 1, 2, 3, 4, 5, 6]]
  });

  // Mint Free Tokens (0-2)
  const { writeContractAsync: mintToken } = useWriteContract();

  const handleMint = async (id: number) => {
    try {
      const hash = await mintToken({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "mintToken",
        args: [id],
      });

      toast.loading("Minting in progress...");

      const receipt = await useWaitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success("Token minted!");
        refetch();
      } else {
        toast.error("Mint failed!");
      }
    } catch (error:any) {
      toast.error(`Mint failed: ${error.message}`);
    }
  };

  // Forge Tokens (Burn to Create)
  const { writeContractAsync: forgeItem } = useWriteContract();

  const handleForge = async (id: number) => {
    try {
      const hash = await forgeItem({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "forgeItem",
        args: [id],
      });

      toast.loading("Forging in progress...");

      const receipt = await useWaitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success("Item forged!");
        refetch();
      } else {
        toast.error("Forge failed!");
      }
    } catch (error:any) {
      toast.error(`Forge failed: ${error.message}`);
    }
  };

  // Trade Tokens
  const { writeContractAsync: tradeItem } = useWriteContract();

  const handleTrade = async (id: number, burnId: number) => {
    try {
      const hash = await tradeItem({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "tradeItem",
        args: [id, burnId],
      });

      toast.loading("Trading in progress...");

      const receipt = await useWaitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        toast.success("Trade successful!");
        refetch();
      } else {
        toast.error("Trade failed!");
      }
    } catch (error:any) {
      toast.error(`Trade failed: ${error.message}`);
    }
  };

  // Handle Cooldown for Minting
  useEffect(() => {
    const checkCooldown = async () => {
      if (isConnected) {
        const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API}`);
        const contract = new ethers.Contract(GAME_LOGIC_CONTRACT, gameLogicAbi, provider);
        const lastMint = await contract.lastMint(address);
        const timeSinceLastMint = Math.floor(Date.now() / 1000) - Number(lastMint);
        setCooldownActive(timeSinceLastMint < 60);
      }
    };
    checkCooldown();
  }, [isConnected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
    <h1 className="text-4xl font-bold">Forget the Tokens</h1>
    <p className="text-gray-400 mt-2">A Web3 token forging platform</p>

    <div className="mt-4">
      <ConnectButton />
    </div>



      <div className="mt-6">
        <a
          href={OPENSEA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          View Collection on OpenSea
        </a>
      </div>

      {/* Show ETH Balance */}
      {isConnected && (
        <div className="mt-4 text-center">
          <p className="text-lg">👤 Address: {address}</p>
          <p className="text-lg">💰 ETH Balance: {balance?.formatted} ETH</p>
          {chain?.id !== sepolia.id && <p className="text-red-500">⚠️ Please switch to Sepolia!</p>}
        </div>
      )}

      {/* Display Tokens */}
      {isConnected && Array.isArray(tokenBalances) && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
    {tokenBalances.map((balance, index) => (
      <Card key={index} className="w-60 p-4">
        <CardHeader>
          <CardTitle>Token #{index}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Balance: {Number(balance)}</p>
          {index < 3 && (
            <Button onClick={() => handleMint(index)} disabled={cooldownActive}>
              Mint {index} {cooldownActive && "(Cooldown Active)"}
            </Button>
          )}
          {index >= 3 && index <= 6 && (
            <Button onClick={() => handleForge(index)} className="bg-purple-500">
              Forge {index}
            </Button>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
)}

      {/* Trade Section */}
      {isConnected && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">🔄 Trade Tokens</h2>
          <p>Select tokens to trade (only 0-2 are tradable)</p>
          <div className="flex space-x-2 mt-2">
            <Button onClick={() => handleTrade(0, 1)}>Trade 0 ⇄ 1</Button>
            <Button onClick={() => handleTrade(1, 2)}>Trade 1 ⇄ 2</Button>
            <Button onClick={() => handleTrade(2, 0)}>Trade 2 ⇄ 0</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
