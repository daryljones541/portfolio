﻿$(document).ready(function () {
    $.ajaxSetup({ cache: false });
    // All 6 AJAX calls below call the same function in the Home Controller.
    // Each passes four flags to communicate the UI state to the function
    $.ajax({
        type: "post",
        url: "/Home/GameTurn",
        data: { playerHit: false, dealerHit: false, userStands: false, startNewGame: false, resetScores: false },
        dataType: "json",
        success: function (data) {
            updateBoard(data);
        },
        error: function (xhr, ajaxOptions, thrownError) { $('#playerLabel').html(xhr.responseText); }
    });
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
        e.preventDefault();
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
        e.preventDefault();
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
        e.preventDefault();
        resetBoard();
        $.ajax({
            type: "post",
            url: "/Home/GameTurn",
            data: { playerHit: false, dealerHit: false, userStands: false, startNewGame: true, resetScores: false },
            dataType: "json",
            success: function (data) {
                updateBoard(data);
            }
        });
    });
});
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
    $('#pCard1').css("visibility", "hidden");
    $('#cCard1').css("visibility", "hidden");
    // display 'game loading'
    $('#playerLabel').html("Please Wait...");
    $('#computerLabel').html('Game is Loading <img src="~/Images/Loading_2_transparent.gif" />');
}
function updateBoard(data) {
    // make user's and computer's card 1 visible    
    $('#pCard1').css("visibility", "visible");
    $('#cCard1').css("visibility", "visible");
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
        $('#hitMeButton').prop("disabled", true);
        $('#standButton').prop("disabled", true);
        $('#playAgainButton').prop("disabled", false);
        $("#cCard1").attr("src", data.computerCards[0]);
    }
    // if the game's not over, disable/enable appropriate buttons
    else {
        $('#hitMeButton').prop("disabled", false);
        $('#playAgainButton').prop("disabled", true);
        // if playerStatus flag is set (user can hit), enable the Stand button
        if (data.playerStatus) $('#standButton').prop("disabled", false);
    }
    // display the player and computer messages returned form the server
    $('#playerLabel').html(data.userLabel);
    $('#computerLabel').html(data.computerLabel);
    // if the player cannot hit but the game is not over, automatically initiate a game turn (computer takes turn)
    if (!data.playerStatus && !data.gameOver) gameTurn();
}