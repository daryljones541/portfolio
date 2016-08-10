$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    startGame();
    // Every AJAX call below passes five flags to the GameTurn C# function
    // playerHit: true to deal player a card if player can hit
    // dealerHit: true to deal dealer a card if dealer can hit
    // userStands: true if the user clicks Stand button
    // startNewGame: true if the user clicks Play Again button
    // resetScores: true if user clicks Reset button
    $('#resetButton').click(function (e) {
        e.preventDefault();
        resetBoard();
        $.ajax({
            type: "post",
            url: "/Home/GameTurn",
            data: { playerHit: true, dealerHit: true, userStands: false, startNewGame: true, resetScores: true },
            dataType: "json",
            success: function (data) {
                updateBoard(data);
            }
        });
    });
    $('#hitMeButton').click(function (e) {
        $.ajax({
            type: "post",
            url: "/Home/GameTurn",
            data: { playerHit: true, dealerHit: true, userStands: false, startNewGame: false, resetScores: false },
            dataType: "json",
            success: function (data) {
                updateBoard(data);
            }
        });
    });
    $('#standButton').click(function (e) {
        $.ajax({
            type: "post",
            url: "/Home/GameTurn",
            data: { playerHit: false, dealerHit: true, userStands: true, startNewGame: false, resetScores: false },
            dataType: "json",
            success: function (data) {
                updateBoard(data);
            }
        });
    });
    $('#playAgainButton').click(function (e) {
        $.ajax({
            type: "post",
            url: "/Home/GameTurn",
            data: { playerHit: false, dealerHit: false, userStands: false, startNewGame: true, resetScores: false },
            dataType: "json",
            success: function (data) {
                $("#cCard1").attr("src", "/Images/Cards/black_back.jpg");
                updateBoard(data);
            }
        });
    });
});

// Called on first load and on Session timeout
function startGame() {
    $.ajax({
        type: "post",
        url: "/Home/GameTurn",
        data: { playerHit: false, dealerHit: false, userStands: false, startNewGame: false, resetScores: false },
        dataType: "json",
        success: function (data) {
            // make user's and computer's card 1 visible    
            $('#pCard1').css("visibility", "visible");
            $('#cCard1').css("visibility", "visible");
            updateBoard(data);
        }
    });
}
    
// called automatically each turn after player stands as long as computer keeps going
function gameTurn() {
    $.ajax({
        type: "post",
        url: "/Home/GameTurn",
        data: { playerHit: false, dealerHit: true, userStands: false, startNewGame: false, resetScores: false },
        dataType: "json",
        success: function (data) {
            updateBoard(data);
        }
    });
}
function resetBoard() {
    // remove cards 2-12 from the board for player and computer and reset their images to back of card
    for (var x = 2; x < 12; x++) {
        $("#pCard" + (x)).hide();
        $("#pCard" + (x)).attr("src", "/Images/Cards/black_back.jpg");
        $("#cCard" + (x)).hide();
        $("#cCard" + (x)).attr("src", "/Images/Cards/black_back.jpg");
    }
    // make cards 1 for player and computer invisible and reset their images to back of card
    $("#pCard1").attr("src", "/Images/Cards/black_back.jpg");
    $("#cCard1").attr("src", "/Images/Cards/black_back.jpg");
    // display 'game loading'
    $('#playerLabel').html("Please Wait...");
    $('#computerLabel').html('Game is Loading <img src="/Images/Loading_2_transparent.gif" alt="loading icon" />');
}
function updateBoard(data) {
    // display user's cards
    for (var x = 0; x < data.userCards.length; x++) {
        $("#pCard" + (x + 1)).attr("src", data.userCards[x]);
        $("#pCard" + (x + 1)).show();
    }
    for (var x = data.userCards.length; x < 11; x++) {
        $("#pCard" + (x + 1)).hide();
    }
    // display computer's cards
    for (var x = 0; x < data.computerCards.length; x++) {
        if (x > 0) $("#cCard" + (x + 1)).attr("src", data.computerCards[x]);
        $("#cCard" + (x + 1)).show();
    }
    for (var x = data.computerCards.length; x < 11; x++) {
        $("#cCard" + (x + 1)).hide();
    }
    // update score labels
    $('#playerScore').html(data.playerScore);
    $('#dealerScore').html(data.dealerScore);
    // if server says the game is over, show computer's face down card and disable/enable appropriate buttons
    if (data.gameOver) {
        $('#hitMeButton').addClass("disabled");
        $('#standButton').addClass("disabled");
        $('#playAgainButton').removeClass("disabled");
        $("#cCard1").attr("src", data.computerCards[0]);
    }
    // if the game's not over, disable/enable appropriate buttons
    else {
        $('#hitMeButton').removeClass("disabled");
        $('#standButton').removeClass("disabled");
        $('#playAgainButton').addClass("disabled");   
    }
    // display the player and computer messages returned form the server
    $('#playerLabel').html(data.userLabel);
    $('#computerLabel').html(data.computerLabel);
    // if the player cannot hit but the game is not over, automatically initiate a game turn (computer takes turn)
    if (data.sessionActive == false) sessionTimeout(" The blackjack game has been reset.");
    if (!data.playerStatus && !data.gameOver) gameTurn();
}