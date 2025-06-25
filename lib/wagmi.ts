import { sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/-IjVfzHTO4eTd0oRVn1UHC_HWuGuV_Bw",
      {
        batch: true,
        timeout: 30000,
      }
    ),
  },
  pollingInterval: 4000,
});
