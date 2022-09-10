// Grab items from the DOM
const player1 = document.getElementById("player1Text");
const player2 = document.getElementById("player2Text");
const player1Card = document.getElementById("player1Card");
const player2Card = document.getElementById("player2Card");
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
    clearText();
    try {
        const response = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            player1Card.src = jsonResponse.cards[0].image;
            player2Card.src = jsonResponse.cards[1].image;
            let player1Val = jsonResponse.cards[0].value;
            let player2Val = jsonResponse.cards[1].value;
            let player1Code = jsonResponse.cards[0].code;
            let player2Code = jsonResponse.cards[1].code;
            compareCards(player1Val, player2Val, player1Code, player2Code);
        }
    } catch (error) {
        console.log(error);
    }
}

const compareCards = (card1, card2, code1, code2) => {
    let card1Num = convertToNumber(card1);
    let card2Num = convertToNumber(card2);
    if (card1Num > card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${code1},${code2}`);
        result.innerText = "Player 1 Wins!";
    } else if (card1Num < card2Num) {
        fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${code1},${code2}`);
        result.innerText = "Player 2 Wins!";

    } else {
        result.innerText = "War!";
    }
}

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

const clearText = () => {
    player1.innerText = "Player 1";
    player2.innerText = "Player 2";
}

onload = shuffleNewDeck();
dealBtn.onclick = drawTwo;