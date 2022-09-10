// Grab items from the DOM
const player1 = document.getElementById("player1Text");
const player2 = document.getElementById("player2Text");
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");
const pile1 = document.getElementById("pile1");
const pile2 = document.getElementById("pile2");
const result = document.getElementById("result");
const dealBtn = document.getElementById("deal_btn");

// Variable to use the same deck
let deckId = localStorage.getItem("deckId");

const shuffleNewDeck = async () => {
    if (!deckId) {
        deckId = "new";
    }
    try {
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/shuffle/?deck_count=1`);
        if (response.ok) {
            const jsonResponse = await response.json();
            deckId = jsonResponse.deck_id;
            localStorage.setItem("deckId", deckId);
        }
    } catch (error) {
        console.log(error);
    }
}

const drawTwo = async() => {
    try {
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
        if (response.ok) {
            const jsonResponse = await response.json();
            // Player 1 card changes
            player1Card.style.visibility = "visible";
            player1Card.src = jsonResponse.cards[0].image;
            // Player 2 card changes
            player2Card.style.visibility = "visible";
            player2Card.src = jsonResponse.cards[1].image;
            // Variables holding the cards' value ("KING", "9", etc.)
            let player1Val = jsonResponse.cards[0].value;
            let player2Val = jsonResponse.cards[1].value;
            // Variables holding the cards' code ("7S", "2C", etc)
            let player1Code = jsonResponse.cards[0].code;
            let player2Code = jsonResponse.cards[1].code;
            // Passing the previously declared variables into this function
            compareCards(player1Val, player2Val, player1Code, player2Code);

            let pile1Num = Number(pile1.innerText);
            let pile2Num = Number(pile2.innerText);

            // If no cards remain in the deck, it's game end
            if (jsonResponse.remaining == 0) {
                if (pile1Num > pile2Num) {
                    // Player 1 Wins
                    // Change and flash background color on pile of winner
                } else {
                    // Player 2 Wins
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Call convertToNumber() to convert card values for easier comparison, and adding cards to the winning player's pile
const compareCards = (card1, card2, code1, code2) => {
    let card1Num = convertToNumber(card1);
    let card2Num = convertToNumber(card2);
    if (card1Num > card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${code1},${code2}`);
        pile1.innerText = Number(pile1.innerText) + 2;
        result.innerText = "Player 1 Wins!";
    } else if (card1Num < card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${code1},${code2}`);
        pile2.innerText = Number(pile2.innerText) + 2;
        result.innerText = "Player 2 Wins!";
    } else {
        result.innerText = "War!";
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

// Get a new shuffled deck when the page loads
onload = shuffleNewDeck();
// Display two cards from the deck when you hit the deal button
dealBtn.onclick = drawTwo;