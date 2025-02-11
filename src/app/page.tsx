"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";
import forgeAbi from "@/utils/forgeAbi.json";
import gameLogicAbi from "@/utils/gameLogicAbi.json";
import Image from "next/image";
import { motion } from "framer-motion";

const FORGE_CONTRACT = "0xF0cac17eAca077c718d929e1D409393a005a1434";
const GAME_LOGIC_CONTRACT = "0xe7E8F47A067f13C0934451364f69Bd402cEce99C";

import Bronze from "../../assets/game-images/bronze.jpeg";
import Silver from "../../assets/game-images/silver.webp";
import Gold from "../../assets/game-images/gold.webp";
import Thor from "../../assets/game-images/thor.jpeg";
import Shield from "../../assets/game-images/shield.jpeg";
import Sword from "../../assets/game-images/oblivion_sword.jpg";
import Dante from "../../assets/game-images/dante.jpeg";

const OPENSEA_LINK = "https://testnets.opensea.io/collection/simplenftuploader";

const assets = [
  { id: 0, name: "Bronze", image: Bronze, color: "bg-amber-800" },
  { id: 1, name: "Silver", image: Silver, color: "bg-gray-400" },
  { id: 2, name: "Gold", image: Gold, color: "bg-yellow-500" },
  { id: 3, name: "Thor's Hammer", image: Thor, color: "bg-blue-900" },
  { id: 4, name: "Shield", image: Shield, color: "bg-gray-700" },
  { id: 5, name: "Oblivion Sword", image: Sword, color: "bg-purple-900" },
  { id: 6, name: "Dante's Key", image: Dante, color: "bg-red-900" },
];

const Home = () => {
  const { address, isConnected } = useAccount();
  const [cooldownActive, setCooldownActive] = useState(false);

  const { data: tokenBalances, refetch } = useReadContract({
    address: GAME_LOGIC_CONTRACT,
    abi: gameLogicAbi,
    functionName: "balanceOfBatch",
    args: [Array(7).fill(address), [0, 1, 2, 3, 4, 5, 6]],
  });

  const {
    writeContract: mintWrite,
    isPending: isMintPending,
    data: mintHash,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  const handleMint = async (id: number) => {
    try {
      await mintWrite({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "mintToken",
        args: [BigInt(id)],
      });
      toast.loading("Minting in progress...");
    } catch (error: any) {
      toast.error(`Mint failed: ${error.shortMessage || error.message}`);
    }
  };

  const {
    writeContract: forgeWrite,
    isPending: isForgePending,
    data: forgeHash,
  } = useWriteContract();

  const { isLoading: isForgeConfirming, isSuccess: isForgeConfirmed } =
    useWaitForTransactionReceipt({
      hash: forgeHash,
    });

  const handleForge = async (id: number) => {
    try {
      await forgeWrite({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "forgeItem",
        args: [id],
      });
      toast.loading("Forging in progress...");
    } catch (error: any) {
      toast.error(`Forge failed: ${error.message}`);
    }
  };

  const {
    writeContract: tradeWrite,
    isPending: isTradePending,
    data: tradeHash,
  } = useWriteContract();

  const { isLoading: isTradeConfirming, isSuccess: isTradeConfirmed } =
    useWaitForTransactionReceipt({
      hash: tradeHash,
    });

  const handleTrade = async (id: number, burnId: number) => {
    try {
      await tradeWrite({
        address: FORGE_CONTRACT,
        abi: forgeAbi,
        functionName: "tradeItem",
        args: [id, burnId],
      });
      toast.loading("Trading in progress...");
    } catch (error: any) {
      toast.error(`Trade failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isMintConfirmed) {
      toast.dismiss()
      toast.success("Token minted successfully!");
      refetch();
    }
    if (isForgeConfirmed) {
      toast.dismiss()
      toast.success("Token forged successfully!");
      refetch();
    }
    if (isTradeConfirmed) {
      toast.dismiss()
      toast.success("Token traded successfully!");
      refetch();
    }
  }, [isMintConfirmed, isForgeConfirmed, isTradeConfirmed]);

  useEffect(() => {
    const checkCooldown = async () => {
      if (isConnected) {
        const provider = new ethers.JsonRpcProvider(
          `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API}`
        );
        const contract = new ethers.Contract(
          GAME_LOGIC_CONTRACT,
          gameLogicAbi,
          provider
        );
        const lastMint = await contract.lastMint(address);
        const timeSinceLastMint =
          Math.floor(Date.now() / 1000) - Number(lastMint);
        setCooldownActive(timeSinceLastMint < 60);
      }
    };
    checkCooldown();
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500"
          >
            ⚔️ Forge of Legends ⚔️
          </motion.h1>
          <p className="text-gray-400 mt-4 text-lg">
            Craft your destiny in the fires of the forge
          </p>

          <div className="mt-6">
            <ConnectButton />
          </div>

          <a
            href={OPENSEA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            View Collection on OpenSea
          </a>
        </div>

        {isConnected && Array.isArray(tokenBalances) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assets.map((asset, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`${asset.color} bg-opacity-20 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden`}>
                  <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-100">
                      {asset.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10">
                      <Image
                        src={asset.image}
                        alt={asset.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-200">
                        Balance: {Number(tokenBalances[index])}
                      </p>
                    </div>

                    {index < 3 && (
                      <div className="w-full space-y-2">
                        <Button
                          onClick={() => handleMint(index)}
                          disabled={cooldownActive || isMintPending}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                          {isMintPending ? "Minting..." : "Mint"}
                          {cooldownActive && " (Cooldown)"}
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1, 2].filter(i => i !== index).map((tradeId) => (
                            <Button
                              key={tradeId}
                              onClick={() => handleTrade(tradeId, index)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Trade {tradeId} ⇄ {index}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {index >= 3 && (
                      <Button
                        onClick={() => handleForge(index)}
                        disabled={isForgePending}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {isForgePending ? "Forging..." : "Forge"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;