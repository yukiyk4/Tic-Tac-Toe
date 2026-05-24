let pkDealHandler = null, pkFoldHandler = null, pkCheckHandler = null, pkRaiseHandler = null, pkNextHandler = null;

export function initPoker() {
    const comCardsContainer = document.getElementById("community-cards");
    const pCardsContainer = document.getElementById("player-poker-cards");
    const b1CardsContainer = document.getElementById("bot1-cards");
    const b2CardsContainer = document.getElementById("bot2-cards");

    const roundTitle = document.getElementById("poker-round-name");
    const potDisplay = document.getElementById("poker-pot");
    const walletDisplay = document.getElementById("poker-wallet");
    const b1ChipsDisplay = document.getElementById("bot1-chips");
    const b2ChipsDisplay = document.getElementById("bot2-chips");

    const b1Bubble = document.getElementById("bot1-bubble");
    const b2Bubble = document.getElementById("bot2-bubble");
    const pBubble = document.getElementById("player-bubble");
    const mainMsg = document.getElementById("poker-msg");

    const pregameCtrls = document.getElementById("poker-pregame-ctrls");
    const actionCtrls = document.getElementById("poker-action-ctrls");
    const nextBtn = document.getElementById("poker-next-btn");

    let deck = [], playerHand = [], bot1Hand = [], bot2Hand = [], communityCards = [];
    let pot = 0, playerChips = 1000, bot1Chips = 1000, bot2Chips = 1000;
    let currentRound = 0; // 0: Pre-flop, 1: Flop, 2: Turn, 3: River
    let activePlayers = { player: true, bot1: true, bot2: true };

    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

    function buildDeck() {
        let arr = [];
        suits.forEach(s => ranks.forEach((r, idx) => arr.push({ rank: r, suit: s, weight: idx })));
        return arr;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function renderCard(card, container, hide = false) {
        const div = document.createElement("div");
        div.className = "pk-card";
        if (card.suit === '♥' || card.suit === '♦') div.classList.add("card-red");
        if (hide) div.classList.add("card-back");
        else div.innerHTML = `<div>${card.rank}</div><div>${card.suit}</div>`;
        container.appendChild(div);
    }

    function updateTableUI(revealAll = false) {
        pCardsContainer.innerHTML = ""; b1CardsContainer.innerHTML = ""; b2CardsContainer.innerHTML = ""; comCardsContainer.innerHTML = "";

        if (activePlayers.player) playerHand.forEach(c => renderCard(c, pCardsContainer));
        if (activePlayers.bot1) bot1Hand.forEach(c => renderCard(c, b1CardsContainer, !revealAll));
        if (activePlayers.bot2) bot2Hand.forEach(c => renderCard(c, b2CardsContainer, !revealAll));
        communityCards.forEach(c => renderCard(c, comCardsContainer));

        potDisplay.textContent = pot;
        walletDisplay.textContent = playerChips;
        b1ChipsDisplay.textContent = bot1Chips;
        b2ChipsDisplay.textContent = bot2Chips;
    }

    function startHand() {
        if (playerChips < 20 || bot1Chips < 20 || bot2Chips < 20) {
            mainMsg.textContent = "Everyone needs at least $20 to play!";
            return;
        }

        // Deduct blind antes
        playerChips -= 20; bot1Chips -= 20; bot2Chips -= 20;
        pot = 60; currentRound = 0;
        activePlayers = { player: true, bot1: true, bot2: true };

        deck = buildDeck(); shuffle(deck);
        playerHand = [deck.pop(), deck.pop()];
        bot1Hand = [deck.pop(), deck.pop()];
        bot2Hand = [deck.pop(), deck.pop()];
        communityCards = [];

        roundTitle.textContent = "Pre-Flop";
        b1Bubble.textContent = "Waiting..."; b2Bubble.textContent = "Waiting..."; pBubble.textContent = "Your Turn";
        mainMsg.textContent = "Cards dealt! Make your move.";

        pregameCtrls.style.display = "none";
        actionCtrls.style.display = "block";
        nextBtn.style.display = "none";
        updateTableUI(false);
    }

    function playerAction(type) {
        if (type === 'fold') {
            activePlayers.player = false;
            pBubble.textContent = "Folded";
            processBotTurns();
        } else if (type === 'check') {
            pBubble.textContent = "Check";
            processBotTurns();
        } else if (type === 'raise') {
            if (playerChips >= 50) {
                playerChips -= 50; pot += 50;
                pBubble.textContent = "Raise $50";
                processBotTurns();
            } else {
                mainMsg.textContent = "Not enough chips to raise!";
            }
        }
    }

    function processBotTurns() {
        // Bot 1 (Aggressive Logic)
        if (activePlayers.bot1) {
            if (Math.random() > 0.4 && bot1Chips >= 50) {
                bot1Chips -= 50; pot += 50;
                b1Bubble.textContent = "Raise $50";
            } else {
                b1Bubble.textContent = "Check / Call";
            }
        }

        // Bot 2 (Conservative Logic)
        if (activePlayers.bot2) {
            if (currentRound === 0 && Math.random() < 0.25) {
                activePlayers.bot2 = false;
                b2Bubble.textContent = "Fold";
            } else {
                b2Bubble.textContent = "Check / Call";
            }
        }

        updateTableUI(false);
        setTimeout(advanceRound, 600);
    }

    function advanceRound() {
        currentRound++;
        // Reset non-folded action status flags
        if (activePlayers.bot1 && b1Bubble.textContent !== "Fold") b1Bubble.textContent = "Thinking...";
        if (activePlayers.bot2 && b2Bubble.textContent !== "Fold") b2Bubble.textContent = "Thinking...";

        if (currentRound === 1) {
            roundTitle.textContent = "The Flop";
            communityCards.push(deck.pop(), deck.pop(), deck.pop());
            mainMsg.textContent = "Flop dealt. Check, Raise or Fold.";
            updateTableUI(false);
        } else if (currentRound === 2) {
            roundTitle.textContent = "The Turn";
            communityCards.push(deck.pop());
            mainMsg.textContent = "Turn card is out!";
            updateTableUI(false);
        } else if (currentRound === 3) {
            roundTitle.textContent = "The River";
            communityCards.push(deck.pop());
            mainMsg.textContent = "Final card! Who has the best hand?";
            updateTableUI(false);
        } else {
            showdown();
        }
    }

    // Evaluates high card weight metrics for determining a winner
    function evaluateHandPower(hand) {
        const fullSet = [...hand, ...communityCards];
        if (fullSet.length === 0) return 0;
        let sum = 0;
        fullSet.forEach(c => sum += c.weight);

        // Simple evaluator: check for pairs
        let counts = {};
        fullSet.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
        let hasPair = Object.values(counts).includes(2);
        let hasThree = Object.values(counts).includes(3);

        if (hasThree) return sum + 300; // Three of a Kind baseline
        if (hasPair) return sum + 100;  // Pair baseline
        return sum;                     // High Card baseline
    }

    function showdown() {
        actionCtrls.style.display = "none";
        nextBtn.style.display = "block";
        updateTableUI(true); // Flip over cards

        let scores = { player: -1, bot1: -1, bot2: -1 };
        if (activePlayers.player) scores.player = evaluateHandPower(playerHand);
        if (activePlayers.bot1) scores.bot1 = evaluateHandPower(bot1Hand);
        if (activePlayers.bot2) scores.bot2 = evaluateHandPower(bot2Hand);

        let winner = 'player';
        let maxScore = scores.player;

        if (scores.bot1 > maxScore) { maxScore = scores.bot1; winner = 'bot1'; }
        if (scores.bot2 > maxScore) { maxScore = scores.bot2; winner = 'bot2'; }

        if (winner === 'player') {
            playerChips += pot;
            mainMsg.textContent = `🎉 You won the pot of $${pot}!`;
        } else if (winner === 'bot1') {
            bot1Chips += pot;
            mainMsg.textContent = `🤖 Bot 1 wins the pot of $${pot}.`;
        } else {
            bot2Chips += pot;
            mainMsg.textContent = `🤖 Bot 2 wins the pot of $${pot}.`;
        }

        pot = 0;
        potDisplay.textContent = pot;
        walletDisplay.textContent = playerChips;

        // Auto re-buy if out of chips
        if (playerChips <= 0) {
            playerChips = 500;
            mainMsg.textContent = "💸 You went broke! Here is a fresh $500 stack.";
            walletDisplay.textContent = playerChips;
        }
    }

    function resetTableState() {
        pregameCtrls.style.display = "block";
        actionCtrls.style.display = "none";
        nextBtn.style.display = "none";
        roundTitle.textContent = "Pre-Flop";
        mainMsg.textContent = "Place ante to deal next hand!";

        playerHand = []; bot1Hand = []; bot2Hand = []; communityCards = [];
        updateTableUI(false);
    }

    // Safety clean attached routers
    const dBtn = document.getElementById("poker-deal-btn");
    const fBtn = document.getElementById("poker-fold-btn");
    const cBtn = document.getElementById("poker-check-btn");
    const rBtn = document.getElementById("poker-raise-btn");
    const nBtn = document.getElementById("poker-next-btn");

    if (pkDealHandler) dBtn.removeEventListener("click", pkDealHandler);
    if (pkFoldHandler) fBtn.removeEventListener("click", pkFoldHandler);
    if (pkCheckHandler) cBtn.removeEventListener("click", pkCheckHandler);
    if (pkRaiseHandler) rBtn.removeEventListener("click", pkRaiseHandler);
    if (pkNextHandler) nBtn.removeEventListener("click", pkNextHandler);

    pkDealHandler = startHand;
    pkFoldHandler = () => playerAction('fold');
    pkCheckHandler = () => playerAction('check');
    pkRaiseHandler = () => playerAction('raise');
    pkNextHandler = resetTableState;

    dBtn.addEventListener("click", pkDealHandler);
    fBtn.addEventListener("click", pkFoldHandler);
    cBtn.addEventListener("click", pkCheckHandler);
    rBtn.addEventListener("click", pkRaiseHandler);
    nBtn.addEventListener("click", pkNextHandler);

    resetTableState();
}
