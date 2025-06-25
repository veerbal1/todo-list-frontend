"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { todoListAbi } from "@/lib/abi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const contractAddress = "0x2a8dCC08D03d92A2358985230546CE0Bcea6f41A";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);

  const { address, isConnected, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  // Define the contract configuration for wagmi hooks
  const todoListContract = {
    address: contractAddress,
    abi: todoListAbi,
  } as const;

  // Wagmi hook to read the next task ID
  const { data: nextTaskIdData, refetch: refetchNextTaskId } = useReadContracts(
    {
      contracts: [{ ...todoListContract, functionName: "nextTaskId" }],
    }
  );
  const nextTaskId =
    nextTaskIdData?.[0].status === "success"
      ? Number(nextTaskIdData[0].result)
      : 0;

  const taskContracts = [];
  if (nextTaskId > 1) {
    for (let i = 1; i < nextTaskId; i++) {
      taskContracts.push({
        ...todoListContract,
        functionName: "getTask",
        args: [BigInt(i)],
      });
    }
  }

  // Wagmi hook to read all tasks at once
  const { data: tasksData, refetch: refetchTasks } = useReadContracts({
    contracts: taskContracts,
  });

  // Effect to handle client-side mounting
  useEffect(() => setIsMounted(true), []);

  // Effect to process and set tasks once they are fetched
  useEffect(() => {
    if (tasksData) {
      const formattedTasks = tasksData
        .filter((task) => task.status === "success")
        .map((task) => task.result);
      setTasks(formattedTasks);
    }
  }, [tasksData]);

  // Wagmi hook to wait for a transaction to be mined
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } =
    useWaitForTransactionReceipt({ 
      hash,
      confirmations: 1,
    });

  // Debug logging
  useEffect(() => {
    if (hash) {
      console.log("Transaction hash:", hash);
      toast.info(`Transaction submitted: ${hash}`);
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirming) {
      console.log("Transaction confirming...");
    }
  }, [isConfirming]);

  useEffect(() => {
    if (txError) {
      console.error("Transaction error:", txError);
      toast.error(`Transaction failed: ${txError.message}`);
    }
  }, [txError]);

  // Refetch data after a successful transaction
  useEffect(() => {
    if (isConfirmed) {
      console.log("Transaction confirmed!");
      refetchNextTaskId();
      refetchTasks();
      toast.success("Transaction confirmed successfully!");
    }
  }, [isConfirmed, refetchNextTaskId, refetchTasks]);

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    
    try {
      console.log("Adding task:", newTask);
      writeContract({
        ...todoListContract,
        functionName: "addTask",
        args: [newTask],
      });
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to submit transaction");
    }
  };

  const handleMarkComplete = (id: bigint) => {
    try {
      console.log("Marking task complete:", id);
      writeContract({
        ...todoListContract,
        functionName: "markTaskCompleted",
        args: [id],
      });
    } catch (error) {
      console.error("Error marking task complete:", error);
      toast.error("Failed to submit transaction");
    }
  };

  // Prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Decentralized Todo List</CardTitle>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-2 py-1">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
                <Badge variant="secondary">
                  {chain?.name || "Unknown"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={() => connect({ connector: injected() })}>
                Connect Wallet
              </Button>
            )}
          </div>
        </CardHeader>

        {isConnected ? (
          <CardContent>
            {chain?.id !== 11155111 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Please switch to Sepolia testnet to use this app. Current network: {chain?.name}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g., Learn Wagmi"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <Button onClick={handleAddTask} disabled={isPending || !newTask.trim()}>
                  {isPending ? "Adding..." : "Add Task"}
                </Button>
              </div>

              {hash && (
                <Alert>
                  <AlertDescription>
                    Transaction submitted: <a 
                      href={`https://sepolia.etherscan.io/tx/${hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline"
                    >
                      View on Etherscan
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              {isConfirming && (
                <Alert>
                  <AlertDescription>
                    Waiting for confirmation... (This may take a few minutes)
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error: {error.message || "Transaction failed"}
                  </AlertDescription>
                </Alert>
              )}

              {txError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Transaction Error: {txError.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Tasks</h2>
                  <Badge>{tasks.length} Tasks</Badge>
                </div>
                <Separator className="my-4" />
                
                {tasks.length > 0 ? (
                  <ul className="space-y-3">
                    {tasks.map((task: any) => (
                      <Card key={Number(task.id)} className={task.isCompleted ? "bg-muted" : ""}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {Number(task.id)}.
                            </span>
                            <span className={task.isCompleted ? "line-through text-muted-foreground" : ""}>
                              {task.description}
                            </span>
                            {task.isCompleted && (
                              <Badge variant="outline" className="ml-2">Completed</Badge>
                            )}
                          </div>
                          {!task.isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkComplete(task.id)}
                              disabled={isPending}
                            >
                              Complete
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Add one!
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">Please connect your wallet to use the Todo List.</p>
            <Button onClick={() => connect({ connector: injected() })}>
              Connect Wallet
            </Button>
          </CardContent>
        )}
      </Card>
    </main>
  );
}
