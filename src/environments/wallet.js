const axios = require("axios");

class WalletEnvironment {
    constructor() {
        this.walletAddress = process.env.WALLET_ADDRESS; // The wallet address to monitor
        this.rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"; // Solana RPC URL
    }

    getCommands() {
        return [
            { 
                name: "tokens", 
                description: "View all SPL-20 tokens in the wallet" 
            },
            { 
                name: "help", 
                description: "Show wallet commands help" 
            }
        ];
    }

    async handleCommand(command, messages) {
        const [action, ...params] = command.split(" ");

        switch (action.toLowerCase()) {
            case "tokens":
                return await this.getTokens();
            case "help":
                return this.help();
            default:
                return {
                    title: "Error",
                    content: `Unknown wallet action: ${action}`,
                };
        }
    }

    async getTokens() {
        try {
            // RPC request to get token accounts
            const response = await axios.post(this.rpcUrl, {
                jsonrpc: "2.0",
                id: 1,
                method: "getTokenAccountsByOwner",
                params: [
                    this.walletAddress,
                    {
                        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" // SPL Token program ID
                    },
                    {
                        encoding: "jsonParsed"
                    }
                ]
            });

            if (response.data.error) {
                throw new Error(response.data.error.message);
            }

            const accounts = response.data.result.value;
            
            // Format the token information
            let tokenList = accounts.map(account => {
                const tokenData = account.account.data.parsed.info;
                return {
                    mint: tokenData.mint,
                    amount: tokenData.tokenAmount.uiAmount,
                    decimals: tokenData.tokenAmount.decimals
                };
            });

            // Filter out zero balances
            tokenList = tokenList.filter(token => token.amount > 0);

            if (tokenList.length === 0) {
                return {
                    title: "Wallet Token Balance",
                    content: "No SPL tokens found in this wallet.",
                };
            }

            // Format the output
            const formattedTokens = tokenList.map(token => 
                `Token: ${token.mint}\nBalance: ${token.amount}\n---`
            ).join("\n");

            return {
                title: "Wallet Token Balance",
                content: `Found ${tokenList.length} tokens in wallet ${this.walletAddress}:\n\n${formattedTokens}`,
                availableActions: [
                    "Use 'web open https://pump.fun/{token_address}' to check token details",
                    "Use 'twitter post' to share insights about tokens"
                ]
            };

        } catch (error) {
            console.error("Error fetching token balances:", error);
            return {
                title: "Error",
                content: `Failed to fetch token balances: ${error.message}`,
            };
        }
    }

    help() {
        return {
            title: "Wallet Help",
            content: `Available commands:
tokens - View all SPL-20 tokens in the wallet
help - Show this help message

Example usage:
wallet tokens
`,
        };
    }
}

module.exports = WalletEnvironment;