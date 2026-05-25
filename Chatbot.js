export function initChatbot() {
    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send-btn");

    function appendMessage(text, isBot = true) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message ${isBot ? 'bot-msg' : 'user-msg'}`;

        if (isBot) {
            msgDiv.innerHTML = `<strong>🤖 AI:</strong> ${text}`;
        } else {
            msgDiv.innerHTML = `<strong>You:</strong> ${text}`;
        }

        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
    }

    // Interactive custom arcade game response dictionary
    function getLocalResponse(input) {
        const query = input.toLowerCase();

        if (query.includes("poker") || query.includes("cards")) {
            return "In Texas Hold'em Poker, pay attention to the bots! Bot 1 plays aggressively and raises a lot, while Bot 2 folds easily if it doesn't have a pair.";
        }
        if (query.includes("wordle") || query.includes("word")) {
            return "Wordle tip: Try starting with words containing popular vowels like 'APPLE', 'EARTH', or 'JUICE' to check key letters early!";
        }
        if (query.includes("snake")) {
            return "In Snake, avoid making sharp, sudden double-back turns, or you might accidentally crash into your own neck!";
        }
        if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
            return "Hello there! I'm your Arcade AI assistant. Ask me anything about Poker, Wordle, Snake, or general gaming tips!";
        }
        if (query.includes("cheat") || query.includes("win")) {
            return "Haha, no cheat codes here! Just pure tactical skill. Which game are you trying to beat right now?";
        }

        return null; // Return null if it needs to fallback to generic AI banter
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Render user question
        appendMessage(text, false);
        chatInput.value = "";

        // Show a brief placeholder loading state
        setTimeout(async () => {
            // 1. Try checking for local game smart answers first
            const localAnswer = getLocalResponse(text);
            if (localAnswer) {
                appendMessage(localAnswer, true);
                return;
            }

            // 2. Free AI Server fallback simulation
            try {
                const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json`);
                const data = await response.json();

                if (data.AbstractText) {
                    appendMessage(data.AbstractText, true);
                } else {
                    appendMessage("Interesting question! I am primarily programmed to help you beat the Arcade games here. Try asking me for 'Poker tips' or 'Wordle strategy'!", true);
                }
            } catch (err) {
                appendMessage("I'm experiencing a brief network lag, but I highly recommend playing a round of Texas Hold'em Poker while I reboot!", true);
            }
        }, 500);
    }

    // Wire listeners up cleanly
    sendBtn.onclick = handleSend;
    chatInput.onkeydown = (e) => {
        if (e.key === "Enter") handleSend();
    };
}
