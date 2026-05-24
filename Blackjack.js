// Keep track of the active handles globally so we can clean up routing pipelines
let currentBJBetHandlers = [];
let currentBJHitHandler = null;
let currentBJStandHandler = null;
let currentBJNextHandler = null;

export function initBlackjack() {
    const dealerCardsContainer = document.getElementById("dealer-cards");
    const playerCardsContainer = document.getElementById("player-cards");
    const dealerScoreInfo = document.getElementById("dealer-score-info");
    const playerScoreInfo = document.getElementById("player-score-info");
    const blackjackMsg = document.getElementById("blackjack-msg");

    const walletDisplay = document.getElementById("bj-wallet");
    const betDisplay = document.getElementById("bj-current-bet");

    const bettingControls = document.getElementById("betting-controls");
    const actionControls = document.getElementById("action-controls");
    const nextBtn = document.getElementById("bj-next-btn");

    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let wallet = parseInt(walletDisplay.textContent) || 1000;
    let currentBet = 0;
    let isRoundActive = false;

    const suits = ['♠', '♥', '♦', '♣'];
    const values = [
        { name: 'A', value: 11 }, { name: '2', value: 2 }, { name: '3', value: 3 },
        { name: '4', value: 4 }, { name: '5', value: 5 }, { name: '6', value: 6 },
        { name: '7', value: 7 }, { name: '8', value: 8 }, { name: '9', value: 9 },
        { name: '10', value: 10 }, { name: 'J', value: 10 }, { name: 'Q', value: 10 },
        { name: 'K', value: 10 }
    ];

    function createDeck() {
        let newDeck = [];
        for (let suit of suits) {
            for (let val of values) {
                newDeck.push({ ...val, suit });
            }
        }
        return newDeck;
    }

    function shuffleDeck(targetDeck) {
        for (let i = targetDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [targetDeck[i], targetDeck[j]] = [targetDeck[j], targetDeck[i]];
        }
        return targetDeck;
    }

    function calculateHandScore(hand) {
        if (!hand || hand.length === 0) return 0;
        let score = 0;
        let aceCount = 0;
        for (let card of hand) {
            score += card.value;
            if (card.name === 'A') aceCount++;
        }
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        return score;
    }

    function renderCard(card, container, isHidden = false) {
        if (!card) return;
        const cardDiv = document.createElement("div");
        cardDiv.className = "bj-card";
        if (card.suit === '♥' || card.suit === '♦') {
            cardDiv.classList.add("card-red");
        }

        if (isHidden) {
            cardDiv.classList.add("card-hidden");
        } else {
            cardDiv.innerHTML = `<div>${card.name}</div><div>${card.suit}</div>`;
        }
        container.appendChild(cardDiv);
    }

    function updateUI(hideDealerCard = true) {
        playerCardsContainer.innerHTML = "";
        dealerCardsContainer.innerHTML = "";

        playerHand.forEach(card => renderCard(card, playerCardsContainer));
        dealerHand.forEach((card, idx) => {
            renderCard(card, dealerCardsContainer, hideDealerCard && idx === 1);
        });

        const pScore = calculateHandScore(playerHand);
        playerScoreInfo.textContent = pScore > 0 ? pScore : "";

        if (hideDealerCard) {
            dealerScoreInfo.textContent = dealerHand[0] ? dealerHand[0].value : "";
        } else {
            const dScore = calculateHandScore(dealerHand);
            dealerScoreInfo.textContent = dScore > 0 ? dScore : "";
        }

        walletDisplay.textContent = wallet;
        betDisplay.textContent = currentBet;
    }

    function startRound(betAmount) {
        if (isRoundActive) return;
        if (wallet < betAmount) {
            blackjackMsg.textContent = "Insufficient funds for that bet!";
            return;
        }

        wallet -= betAmount;
        currentBet = betAmount;
        isRoundActive = true;

        deck = shuffleDeck(createDeck());
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];

        blackjackMsg.textContent = "Hit or Stand?";
        bettingControls.style.display = "none";
        actionControls.style.display = "flex";
        nextBtn.style.display = "none";

        updateUI(true);

        if (calculateHandScore(playerHand) === 21) {
            endRound("blackjack");
        }
    }

    function hit() {
        if (!isRoundActive) return;
        playerHand.push(deck.pop());
        updateUI(true);

        if (calculateHandScore(playerHand) > 21) {
            endRound("bust");
        }
    }

    function stand() {
        if (!isRoundActive) return;

        updateUI(false);

        let dealerScore = calculateHandScore(dealerHand);
        const botDealerLoop = setInterval(() => {
            // Check if user moved away from blackjack screen to prevent memory leaks
            const section = document.getElementById("blackjack-page");
            if (section && !section.classList.contains("active")) {
                clearInterval(botDealerLoop);
                return;
            }

            if (dealerScore < 17) {
                dealerHand.push(deck.pop());
                updateUI(false);
                dealerScore = calculateHandScore(dealerHand);
            } else {
                clearInterval(botDealerLoop);
                evaluateWinner();
            }
        }, 400);
    }

    function evaluateWinner() {
        const pScore = calculateHandScore(playerHand);
        const dScore = calculateHandScore(dealerHand);

        if (dScore > 21) endRound("dealer-bust");
        else if (pScore > dScore) endRound("win");
        else if (dScore > pScore) endRound("lose");
        else endRound("push");
    }

    function endRound(outcome) {
        isRoundActive = false;
        actionControls.style.display = "none";
        nextBtn.style.display = "block";

        updateUI(false);

        if (outcome === "blackjack") {
            const winnings = Math.floor(currentBet * 2.5);
            wallet += winnings;
            blackjackMsg.textContent = `🎉 Blackjack! Won $${winnings}!`;
        } else if (outcome === "win" || outcome === "dealer-bust") {
            wallet += currentBet * 2;
            blackjackMsg.textContent = `👍 You Win! Won $${currentBet * 2}!`;
        } else if (outcome === "bust") {
            blackjackMsg.textContent = "💥 Busted! You went over 21.";
        } else if (outcome === "lose") {
            blackjackMsg.textContent = `🤖 Dealer wins this round.`;
        } else if (outcome === "push") {
            wallet += currentBet;
            blackjackMsg.textContent = "⚖️ Push! It's a tie.";
        }

        currentBet = 0;
        betDisplay.textContent = currentBet;
        walletDisplay.textContent = wallet;

        if (wallet <= 0) {
            blackjackMsg.textContent = "💸 Game Over! Out of money. Fresh $500 added!";
            wallet = 500;
            walletDisplay.textContent = wallet;
        }
    }

    function prepareNextRound() {
        isRoundActive = false;
        bettingControls.style.display = "flex";
        actionControls.style.display = "none";
        nextBtn.style.display = "none";
        blackjackMsg.textContent = "Place your bet for the next round!";

        playerHand = [];
        dealerHand = [];
        updateUI(true);
    }

    // CLEANUP PIPELINE: Remove older handlers to keep actions clean
    const oldBetBtns = document.querySelectorAll(".bet-btn");
    oldBetBtns.forEach((btn, index) => {
        if (currentBJBetHandlers[index]) {
            btn.removeEventListener("click", currentBJBetHandlers[index]);
        }
    });

    currentBJBetHandlers = [];
    oldBetBtns.forEach((btn) => {
        const handler = () => {
            const amount = parseInt(btn.getAttribute("data-amount"));
            startRound(amount);
        };
        currentBJBetHandlers.push(handler);
        btn.addEventListener("click", handler);
    });

    const hitElement = document.getElementById("bj-hit-btn");
    const standElement = document.getElementById("bj-stand-btn");
    const nextElement = document.getElementById("bj-next-btn");

    if (currentBJHitHandler) hitElement.removeEventListener("click", currentBJHitHandler);
    if (currentBJStandHandler) standElement.removeEventListener("click", currentBJStandHandler);
    if (currentBJNextHandler) nextElement.removeEventListener("click", currentBJNextHandler);

    currentBJHitHandler = hit;
    currentBJStandHandler = stand;
    currentBJNextHandler = prepareNextRound;

    hitElement.addEventListener("click", currentBJHitHandler);
    standElement.addEventListener("click", currentBJStandHandler);
    nextElement.addEventListener("click", currentBJNextHandler);

    // Initial setup reset
    prepareNextRound();
}
