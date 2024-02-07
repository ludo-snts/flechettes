let players = [];
let playerHistories = [];
let playerCount = 1;
let currentPlayerIndex = 0;
let scoreBoardElement;
const historyList = document.getElementById("historyList");

function setupGame() {
    playerCount = parseInt(document.getElementById("playerCount").value);
    initializePlayers(playerCount);
    createScoreboard();
    displayBottom();
    displayResetButton();
    updateScoreboard();
    displayCurrentPlayer();
    hideTop();
}

function initializePlayers(playerCount) {
    if (players.length === 0) {
        players = [];
        playerHistories = [];
        historyList.innerHTML = '';
        showPlayerNameSelectionPopup(0);
    }
}

// Créer le tableau du score (nom et score)
function createScoreboard() {
    scoreBoardElement = scoreBoardElement || document.getElementById("scoreBoard");

    // Créer un tableau pour le score du jeu et l'ajouter à la page
    if (!scoreBoardElement) {
        scoreBoardElement = document.createElement("div");
        scoreBoardElement.id = "scoreBoard";
        document.body.appendChild(scoreBoardElement);
    }

    // Nettoyer le tableau pour le nouveau jeu
    scoreBoardElement.textContent = "";

    // Pour chaque joueur, ajouter deux éléments au tableau avec le nom et le score
    players.forEach(player => {
        const playerNameElement = document.createElement("span");
        playerNameElement.classList.add("player");
        playerNameElement.textContent = `${player.name}`;

        const playerScoreElement = document.createElement("span");
        playerScoreElement.classList.add("score");
        playerScoreElement.textContent = `Score: ${player.score}`;

        // Ajouter les éléments au tableau
        scoreBoardElement.appendChild(playerNameElement);
        scoreBoardElement.appendChild(playerScoreElement);
    });
}

// Mettre à jour le tableau du score : 
// Ajouter le nom de chaque joueur
// Modifier le score de la chaque lancer
function updateScoreboard() {
    const scoreboard = document.getElementById("scoreBoard");
    scoreboard.innerHTML = "";
    const currentPlayer = players[currentPlayerIndex];

    players.forEach((player, index) => {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player");

        const playerNameParagraph = document.createElement("p");
        playerNameParagraph.classList.add("playerName");
        playerNameParagraph.textContent = `${player.name}`;

        const playerScoreParagraph = document.createElement("p");
        playerScoreParagraph.classList.add("playerScore");
        playerScoreParagraph.textContent = `${player.score}`;

        playerDiv.appendChild(playerNameParagraph);
        playerDiv.appendChild(playerScoreParagraph);

        scoreboard.appendChild(playerDiv);


    });
}

// Afficher le nom du joueur en cours
function displayCurrentPlayer() {
    const currentPlayerElement = document.getElementById("currentPlayer");

    // Check if there are players in the array
    if (players.length > 0) {
        // Ensure currentPlayerIndex is within bounds
        currentPlayerIndex = currentPlayerIndex % players.length;
        const currentPlayer = players[currentPlayerIndex];

        // Display the current player
        currentPlayerElement.textContent = `${currentPlayer.name}, à toi de jouer !`;
    } else {
        currentPlayerElement.textContent = "Choisis ton nom :";
    }
}

// Annuler le dernier enregistrement de score (possibilité d'effacer dans la limite des 3 lancers  en cours)
function undoLastScore() {
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerHistory = playerHistories[currentPlayerIndex];

    if (currentPlayerHistory.length > 0 && currentPlayer.dartsThrown > 0) {
        const lastEntry = currentPlayerHistory.pop(); // Retirez le dernier élément de l'historique du joueur

        // Annulez les changements du dernier score
        currentPlayer.score += lastEntry.points;
        currentPlayer.dartsThrown--;

        // Mise à jour de l'affichage
        updateScoreboard();
        updateHistory();
        displayCurrentPlayer();
    } else if (currentPlayer.dartsThrown === 0) {
        alert("Vous ne pouvez pas annuler davantage de lancer pour " + currentPlayer.name + ".");
    } else {
        alert("L'historique est vide, impossible d'annuler davantage.");
    }

    // Afficher ou cacher le bouton "Annuler dernier lancer"
    displayUndoButton();
}

function recordScore(section, multiplier, label) {
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerHistory = playerHistories[currentPlayerIndex];

    // Verifier si le joueur en cour a 3 lancers
    if (currentPlayer.dartsThrown >= 3) {
        return;
    }

    // Calculer le score
    // Si label est un nombre, score = section
    // Si label est 'D', score = section * 2
    // Sinon score = section * 3
    let score = (typeof label === 'number') ? section : (label === 'D' ? section * 2 : section * 3);


    // Retirer le score du lancer du score du joueur
    if (currentPlayer.score - score >= 0) {
        currentPlayer.score -= score;
        // Mettre a jour l'historique du joueur :
        // Ajouter un lancer pour le joueur en cours, max 3
        // Ajouter le score mis à jour
        currentPlayerHistory.push({ dart: currentPlayer.dartsThrown + 1, points: score });
    } else {
        // Opérateur ternaire : Si score = 0, points = -1, sinon points = 0
        let points;
        if (score === 0) {
            points = 0;
        } else {
            points = -1;
        }
        currentPlayerHistory.push({ dart: currentPlayer.dartsThrown + 1, points: points });
    }

    // Incrémenter le nombre de lancers +1
    currentPlayer.dartsThrown++;
    updateScoreboard();
    updateHistory();

    // Réinitialiser le nombre de lancers à 0
    if (currentPlayer.dartsThrown === 3 || currentPlayer.score === 0) {
        currentPlayer.dartsThrown = 0;
        // Ou afficher la fenêtre modale de fin de partie
        if (currentPlayer.score === 0) {
            showEndOfGamePopup();
            return;
        }
        // Afficher le nom du prochain joueur
        currentPlayerIndex = (currentPlayerIndex < playerCount - 1) ? currentPlayerIndex + 1 : 0;
        displayCurrentPlayer();
    }

    // Afficher ou cacher le bouton "Annuler dernier lancer"
    displayUndoButton();
}

function updateHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    for (let i = 0; i < playerCount; i++) {
        const playerHistory = playerHistories[i];
        const listItem = document.createElement("li");
        listItem.innerHTML = `<span class="historyPlayerName">${players[i].name} :</span>`;
        // Score initial
        let currentScore = 301;

        const throwGroup = document.createElement("div");
        throwGroup.classList.add("groupeLancer");
        listItem.appendChild(throwGroup);

        for (let j = 0; j < playerHistory.length; j++) {
            const entry = playerHistory[j];
            // Deduire le nombre de points de chaque lancer au score
            if (entry.points !== -1) {
                currentScore -= entry.points;
            }
            // Créer une nouvelle div tous les trois lancers (sauf pour les trois premiers)
            if (j !== 0 && j % 3 === 0) {
                const newThrowGroup = document.createElement("div");
                newThrowGroup.classList.add("groupeLancer");
                listItem.appendChild(newThrowGroup);
            }
            const throwItem = document.createElement("span");
            // Afficher "à côté" pour les tirs à coté, afficher "ça dépasse" pour les tirs qui dépassent le score total
            let displayScore;
            if (entry.points === 0) {
                displayScore = currentScore >= 0 ? `à coté ! (${currentScore})` : "à coté";
                // sinon, afficher le score
            } else if (entry.points === -1) {
                displayScore = currentScore >= 0 ? `ça dépasse !` : "ça dépasse";

            } else {
                displayScore = `${entry.points} (${currentScore})`;
            }
            throwItem.innerHTML = ` lancer ${j + 1} : ${displayScore}`;
            // Ajouter le span à la dernière div créée
            listItem.lastChild.appendChild(throwItem);
        }

        historyList.appendChild(listItem);
    }
}

// Afficher la div bottom
function displayBottom() {
    const bottomSection = document.querySelector(".bottom");

    // Check if players array is not empty
    if (players.length > 0) {
        const currentPlayer = players[currentPlayerIndex];
        bottomSection.style.display = "grid";
    } else {
        console.error("Players array is empty. Make sure it is properly initialized.");
    }
}

// Vérifier si le bouton Annuler dernier lancer doit être affiché
function displayUndoButton() {
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerHistory = playerHistories[currentPlayerIndex];
    const undoButton = document.getElementById("undoButton");

    if (currentPlayerHistory.length > 0 && currentPlayer.dartsThrown > 0) {
        undoButton.style.display = "block"; // Afficher le bouton pour annuler le dernier lancer
    } else {
        undoButton.style.display = "none"; // Cacher le bouton s'il n'est pas possible d'annuler le dernier lancer
    }
}

// Afficher le button reset
function displayResetButton() {
    const resetButton = document.getElementById("reset");
    resetButton.style.display = "block";
}


// Cacher la div top
function hideTop() {
    const topSection = document.querySelector(".top");
    topSection.style.display = "none";
}

// Afficher la fenêtre modale de saisie du nom du joueur
function showPlayerNameSelectionPopup(playerIndex) {
    // Ajouter la classe au body pour griser le fond
    document.body.classList.add('popup-open');

    // Créer la popup
    const popup = document.createElement("div");
    popup.classList.add("playerNameSelectionPopup");

    // Créer la div playerNameSelectionGroup
    const playerNameSelectionGroup = document.createElement("div");
    playerNameSelectionGroup.classList.add("playerNameSelectionGroup");

    // Input
    const playerNameInput = document.createElement("input");
    playerNameInput.classList.add("playerNameSelectionInput");
    playerNameInput.placeholder = `Nom du joueur ${playerIndex + 1}`;
    playerNameInput.type = "text";

    // Ajout de l'écouteur d'événement pour la touche Entrée
    playerNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Empêcher le comportement par défaut (par exemple, soumettre le formulaire)
            confirmButton.click(); // Simuler un clic sur le bouton de validation
        }
    });

    // Bouton
    const confirmButton = document.createElement("button");
    confirmButton.id = "playerNameSelectionButton";
    confirmButton.textContent = "Valider";
    confirmButton.addEventListener("click", function () {
        const playerName = playerNameInput.value.trim() || `Joueur ${playerIndex + 1}`;
        players.push({ id: playerIndex + 1, name: playerName, score: 301, dartsThrown: 0 });
        playerHistories.push([]);
        document.body.removeChild(popup);

        // Vérifier s'il s'agit du dernier joueur
        if (playerIndex === playerCount - 1) {
            setupGame();
            // Si c'est le dernier joueur, supprimer la classe 'popup-open'
            document.body.classList.remove('popup-open');
        } else {
            showPlayerNameSelectionPopup(playerIndex + 1); // Passer au joueur suivant
        }
    });

    // Ajouter l'input à la div playerNameSelectionGroup
    playerNameSelectionGroup.appendChild(playerNameInput);

    // Ajouter l'input et le label à la div playerNameSelectionGroup
    popup.appendChild(playerNameSelectionGroup);

    // Ajouter le bouton à la popup
    popup.appendChild(confirmButton);

    // Ajouter la popup à la page
    document.body.appendChild(popup);

    // Mettre le focus sur l'input
    playerNameInput.focus();
}

// Afficher la fenêtre modale de fin de partie
function showEndOfGamePopup() {
    // Ajouter une classe à la page pour griser le fond
    document.body.classList.add('popup-open');

    // Créer une popup avec un message de fin de partie et un bouton de recommencer
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
        <p>Partie terminée ! ${players[currentPlayerIndex].name} a gagné !</p>
        <button class="restartButton" onclick="restartGame()">Recommencer</button>
        <button class="resetButton" onclick="resetPage()">Réinitialiser</button>
    `;

    // Ajouter la popup à la page
    document.body.appendChild(popup);
}

// Recommencer le jeu
function restartGame() {
    // Retirer la classe du body pour rétablir l'interaction avec la page
    document.body.classList.remove('popup-open');

    // Réinitialiser les scores des joueurs, leurs historiques et le nombre de lancers
    players.forEach(player => {
        player.score = 301;
        player.dartsThrown = 0;
    });
    playerHistories = Array.from({ length: playerCount }, () => []);

    // Mettre à jour le tableau du score et l'historique
    updateScoreboard();
    updateHistory();
    displayUndoButton();

    // Fermer la popup
    const popup = document.querySelector(".popup");
    if (popup) {
        popup.remove();
    }

    // Afficher le nom du premier joueur
    currentPlayerIndex = 0;
    displayCurrentPlayer();
}

// Reinitialiser la page
function resetPage() {
    // Supprimer la classe pour rétablir l'interaction avec la page
    document.body.classList.remove('popup-open');

    // Réinitialiser toute la page
    location.reload();
}

// Afficher la fenêtre modale de la FAQ
function showFAQPopup() {
    const body = document.body;

    // Ajouter la classe 'popup-open' au body pour griser le fond
    body.classList.add('popup-open');

    // Créer la fenêtre modale de la FAQ
    const faqPopup = document.createElement("div");
    faqPopup.classList.add("faqPopup");
    
    const faqPopupContent = document.createElement("div");
    faqPopupContent.classList.add("faqPopupContent");
    
    faqPopupContent.innerHTML = `
        <button id="closefaqPopup" onclick="closefaqPopup()">X</button>
        <h2>Foire aux Flechettes</h2>
        <h3>Comment on commence ?</h3>
        <p>Choisissez le nombre de joueurs et appuyez sur le bouton <span class="buttonFaq">"Commencer"</span>.</p>
        <p>Choisissez le nom du ou des joueurs (Si vide on les appelera "Joueur 1", "Joueur 2", ...).</p>
        <h3>Comment on marque les points d'un lancer ?</h3>
        <p>Cliquez sur la zone de la cible correspondante, et les points apparaitront dans l'historique du joueur.</p>
        <p>Appuyez sur <span class="buttonFaq">"Annuler dernier lancer"</span> pour annuler le dernier lancer.</p>
        <h3>A la fin de la partie on fait quoi ?</h3>
        <p>Appuyez sur <span class="buttonFaq">"Recommencer"</span> pour recommencer une partie avec les mêmes paramètres.</p>
        <p>Appuyez sur <span class="buttonFaq">"Réinitialiser"</span> pour réinitialiser la page.</p>
        <h3>Et le gros bouton <span class="buttonFaq">"Reset"</span> il sert à quoi ?</h3>
        <p>Il fait tout exploser.</p>
    `;
    
    faqPopup.appendChild(faqPopupContent);
    body.appendChild(faqPopup);
}

// Fermer la fenêtre modale de la FAQ
function closefaqPopup() {
    const body = document.body;
    const faqPopup = document.querySelector('.faqPopup');

    // Supprimer la classe 'popup-open' du body
    body.classList.remove('popup-open');

    // Retirer la fenêtre modale de la FAQ du DOM
    faqPopup.parentNode.removeChild(faqPopup);
}


