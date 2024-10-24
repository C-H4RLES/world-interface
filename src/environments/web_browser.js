const axios = require("axios");

class WebBrowser {
    constructor() {
        this.jinaApiUrl = "https://r.jina.ai/";
        this.jinaApiKey = process.env.JINA_API_KEY;
    }

    getCommands() {
        return [
            {
                name: "open",
                description: "Open a URL and see the contents of a page.",
            },
            { name: "help", description: "Show Web Browser help" },
        ];
    }

    async handleCommand(command, messages) {
        const [action, ...params] = command.split(" ");

        switch (action.toLowerCase()) {
            case "open":
                return await this.openLink(params.join(" "));
            case "help":
                return this.help();
            default:
                return {
                    title: "Error",
                    content: `Unknown action: ${action}`,
                };
        }
    }

    async openLink(url) {
        try {
            // Clean and validate the URL
            const cleanUrl = url.trim().replace(/^["']|["']$/g, "");
            if (!cleanUrl.startsWith("http")) {
                throw new Error("URL must start with http:// or https://");
            }

            const response = await axios.get(`${this.jinaApiUrl}${cleanUrl}`, {
                headers: {
                    Authorization: `Bearer ${this.jinaApiKey}`,
                    Accept: "application/json"
                },
            });

            // Extract relevant information from the new response format
            if (response.data.code === 200 && response.data.data) {
                const { title, description, url: sourceUrl, content } = response.data.data;
                
                return {
                    title: `PAGE TITLE: ${title || "No title available"}\nSOURCE URL: ${sourceUrl || cleanUrl}${description ? "\nDESCRIPTION: " + description : ""}`,
                    content: `PAGE CONTENT:\n\n${content || "No content available"}\n\n---\n\nTo navigate to another page, use the 'web open' command with the full URL. You can also use 'twitter post' to share interesting findings on Twitter.`,
                };
            } else {
                throw new Error("Invalid response format from Jina API");
            }
        } catch (error) {
            console.error("Error opening link:", error);
            return {
                title: "Error Opening Link",
                content: error.response?.data?.message || error.message,
            };
        }
    }

    help() {
        return {
            title: "Web Browser Help",
            content: `Available commands:
open <url> - Open a URL and see the contents of a page. The URL must start with http:// or https://.
help - Show this help message

Example usage:
web open https://pump.fun/51BqGGALnzxfNdrMgDVhR7hopNdZJ4A9ncep7AyYpump
web open https://www.example.com`,
        };
    }
}

module.exports = WebBrowser;