// Grab items from the DOM
// Image for card just drawn for each player
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");
// Background card image for each player, will use variable only to toggle visibility during war rounds
const player1ExtraCard = document.getElementById("player1_extra_card");
const player2ExtraCard = document.getElementById("player2_extra_card");
// The piles that hold cards won by each player
const pile1 = document.getElementById("pile1");
const pile2 = document.getElementById("pile2");
// Get text that will say which player won that round
const result = document.getElementById("result");
const dealBtn = document.getElementById("deal_btn");

// Variable to use the same deck even after the browser is closed
let deckId = localStorage.getItem("deckId");

let numOfCardsToAdd = 0;
let numOfCardsDrawn = 0;

// Runs on page load. Gets a new deck and shuffles it, or takes a deck from localStorage that was already being used and shuffles that one, then deals to two players
const shuffleAndDealDeck = async () => {
    if (!deckId) {
        deckId = "new";
    }
    try {
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/shuffle`);
        if (response.ok) {
            const jsonResponse = await response.json();
            deckId = jsonResponse.deck_id;
            localStorage.setItem("deckId", deckId);
        }
        try {
            // Deal cards to players, so two piles needed
            const response1 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=26`);
            const response2 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=26`);
            if (response1.ok && response2.ok) {
                const jsonResponse1 = await response1.json();
                const jsonResponse2 = await response2.json();
                let pile1Parameter = "";
                let pile2Parameter = "";
                for (let i = 0; i < 26; i++) {
                    pile1Parameter += `${jsonResponse1.cards[i].code},`;
                    pile2Parameter += `${jsonResponse2.cards[i].code},`;
                }
                // Add cards to appropriate piles
                await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${pile1Parameter}`);
                await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${pile2Parameter}`);
            }
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
}

// Main function that everthing goes in and out of. All other functions below this are helper functions to this one.
const drawCards = async() => {
    player1ExtraCard.style.visibility = "hidden";
    player2ExtraCard.style.visibility = "hidden";
    try {
        const response1 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/draw/bottom/?count=1`);
        const response2 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/draw/bottom/?count=1`);
        if (response1.ok && response2.ok) {
            const jsonResponse1 = await response1.json();
            const jsonResponse2 = await response2.json();
            // Player 1 card changes
            player1Card.style.visibility = "visible";
            player1Card.src = jsonResponse1.cards[0].image;
            // Player 2 card changes
            player2Card.style.visibility = "visible";
            player2Card.src = jsonResponse2.cards[0].image;
            // Variables holding the cards' value ("KING", "9", etc.)
            let player1Val = jsonResponse1.cards[0].value;
            let player2Val = jsonResponse2.cards[0].value;
            let player1CardCode = jsonResponse1.cards[0].code;
            let player2CardCode = jsonResponse2.cards[0].code;
            compareCards(player1Val, player2Val, player1CardCode, player2CardCode);

            // Number of cards in each pile
            let pile1Num = Number(pile1.innerText);
            let pile2Num = Number(pile2.innerText);

            // When one player holds all of the cards, it's game over
            if (pile1Num >= 52) {
                gameOver("player1");
            } else if (pile2Num >= 52) {
                gameOver("player2");
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Call convertToNumber() to convert card values for easier comparison and then add cards to the winning player's pile
const compareCards = (card1, card2, code1, code2, code3, code4) => {
    let card1Num = convertToNumber(card1);
    let card2Num = convertToNumber(card2);
    numOfCardsToAdd++;
    numOfCardsDrawn++;
    if (card1Num > card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${code1},${code2},${code3},${code4}`);
        pile1.innerText = Number(pile1.innerText) + numOfCardsToAdd;
        pile2.innerText = Number(pile2.innerText) - numOfCardsDrawn;
        result.innerText = "Player 1 Wins!";
        dealBtn.onclick = drawCards;
    } else if (card1Num < card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${code1},${code2},${code3},${code4}`);
        pile2.innerText = Number(pile2.innerText) + numOfCardsToAdd;
        pile1.innerText = Number(pile1.innerText) - numOfCardsDrawn;
        result.innerText = "Player 2 Wins!";
        dealBtn.onclick = drawCards;
    } else {
        result.innerText = "War!";
        dealBtn.onclick = drawCardsForWarRound;
        pile1.innerText = Number(pile1.innerText) - numOfCardsDrawn;
        pile2.innerText = Number(pile2.innerText) - numOfCardsDrawn;
        numOfCardsDrawn--;
        numOfCardsToAdd++;
    }

    // Reset number of cards to add to winning player's pile
    if (result.innerText !== "War!") {
        numOfCardsToAdd = 0;
        numOfCardsDrawn = 0;
    }
}

// Convert cards to number values
const convertToNumber = (card) => {
    switch (card) {
        case "ACE":
            return 14;
            break;
        case "KING":
            return 13;
            break;
        case "QUEEN":
            return 12;
            break;
        case "JACK":
            return 11;
            break;
        default:
            return Number(card);
            break;
    }
}

const drawCardsForWarRound = async () => {
    numOfCardsToAdd++;
    numOfCardsDrawn++;
    try {
        const response1 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/draw/bottom/?count=2`);
        const response2 = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/draw/bottom/?count=2`);
        if (response1.ok && response2.ok) {
            const jsonResponse1 = await response1.json();
            const jsonResponse2 = await response2.json();
            // Card image changes for both players
            player1Card.src = jsonResponse1.cards[0].image;
            player2Card.src = jsonResponse2.cards[0].image;
            player1ExtraCard.style.visibility = "visible";
            player2ExtraCard.style.visibility = "visible";
            // Variables holding the cards' value ("KING", "9", etc.)
            let player1Val = jsonResponse1.cards[0].value;
            let player2Val = jsonResponse2.cards[0].value;
            let player1FirstCardCode = jsonResponse1.cards[0].code;
            let player2FirstCardCode = jsonResponse2.cards[0].code;
            let player1SecondCardCode = jsonResponse1.cards[1].code;
            let player2SecondCardCode = jsonResponse2.cards[1].code;
            compareCards(player1Val, player2Val, player1FirstCardCode, player2FirstCardCode, player1SecondCardCode, player2SecondCardCode);
        }
    } catch (error) {
        console.log(error);
    }
}

// will be set to setInterval return value
let colorChanger;

const gameOver = (winner) => {
    result.innerText = "Game Over!";
    dealBtn.innerText = "Play Again!";
    const colors = ["blue", "red", "green", "orange", "yellow", "purple", "pink"];
    let randomNum;
    if (winner === "player1") {
        colorChanger = setInterval(() => {
            let excludeNum = randomNum;
            while (randomNum === excludeNum) {
                randomNum = Math.floor(Math.random() * colors.length);
            }
            pile1.style.backgroundColor = colors[randomNum];
        }, 800);
        colorChanger;
    } else {
        colorChanger = setInterval(() => {
            let excludeNum = randomNum;
            while (randomNum === excludeNum) {
                randomNum = Math.floor(Math.random() * colors.length);
            }
            pile2.style.backgroundColor = colors[randomNum];
        }, 800);
        colorChanger;
    }
    dealBtn.onclick = resetPlayingArea;
}

const resetPlayingArea = () => {
    clearInterval(colorChanger);
    pile1.style.backgroundColor = "#6b8e23";
    pile2.style.backgroundColor = "#6b8e23";
    pile1.innerText = 26;
    pile2.innerText = 26;
    player1Card.style.visibility = "hidden";
    player2Card.style.visibility = "hidden";
    result.innerText = "";
    dealBtn.innerText = "Deal!";
    dealBtn.onclick = drawCards;
    shuffleAndDealDeck;
}

onload = shuffleAndDealDeck();
dealBtn.onclick = drawCards;