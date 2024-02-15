// Appliquer le thème (clair ou sombre) à partir du local storage
// applyThemeFromLocalStorage();

// Gestionnaire d'événements
// TODO Faire tous les autres
const themeSwitchInput = document.getElementById('themeSwitchInput');
themeSwitchInput.addEventListener('change', toggleTheme);


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
    hideLauncher();
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
// Modifier le score à chaque lancer
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

    if (players.length > 0) {

        currentPlayerIndex = currentPlayerIndex % players.length;
        const currentPlayer = players[currentPlayerIndex];

        // Vérifier si le joueur peut finir avec un double
        if (canFinishWithDouble(currentPlayer.score)) {
            // Si oui, afficher le message approprié
            currentPlayerElement.textContent = `${currentPlayer.name}, à toi de jouer ! Tu peux finir avec un double ${currentPlayer.score / 2}`;
        } else {
            // Sinon, afficher le message standard
            currentPlayerElement.textContent = `${currentPlayer.name}, à toi de jouer !`;
        }
    } else {
        // message à afficher lors du choix du nom d'un nouveau joueur
        currentPlayerElement.textContent = "Choisis ton nom :";
    }
}

// 
function recordScore(section, multiplier, label) {
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerHistory = playerHistories[currentPlayerIndex];

    // Vérifier si le joueur en cours a 3 lancers
    if (currentPlayer.dartsThrown >= 3) {
        return;
    }

    // Calculer le score
    // Si label est 'S', score = section
    // Si label est 'D', score = section * 2
    // Sinon score = section * 3
    let score = (label === 'S') ? section : (label === 'D' ? section * 2 : section * 3);

    // Retirer le score du lancer du score du joueur
    if (currentPlayer.score - score >= 0) {
        currentPlayer.score -= score;
        // Mettre à jour l'historique du joueur :
        // Ajouter un lancer pour le joueur en cours, max 3
        // Ajouter le score mis à jour
        currentPlayerHistory.push({ 
            dart: currentPlayer.dartsThrown + 1, 
            points: score,
            section: section,
            multiplier: multiplier,
            label: label
        });
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

    // Si le score du joueur actuel est de 0, afficher la popup de fin de partie
    if (currentPlayer.score === 0) {
        showEndOfGamePopup();
        return; // Sortir de la fonction car la partie est terminée
    }

    // Vérifier si le score restant est un double
    if (canFinishWithDouble(currentPlayer.score)) {
        console.log("Double possible");
    } else {
        console.log("Double impossible");
    }

    // Incrémenter le nombre de lancers +1
    currentPlayer.dartsThrown++;

    // Vérifier si le score est égal à -1
    if (currentPlayerHistory[currentPlayerHistory.length - 1].points === -1) {
        // Si le score est -1, passer automatiquement au joueur suivant
        currentPlayerIndex = (currentPlayerIndex < playerCount - 1) ? currentPlayerIndex + 1 : 0;
        currentPlayer.dartsThrown = 0; // Réinitialiser le nombre de lancers à 0 pour le nouveau joueur
    }

    updateScoreboard();
    updateHistory();

    // Si le joueur actuel a terminé ses 3 lancers, passer au joueur suivant
    if (currentPlayer.dartsThrown === 3) {
        currentPlayerIndex = (currentPlayerIndex < playerCount - 1) ? currentPlayerIndex + 1 : 0;
        currentPlayer.dartsThrown = 0; // Réinitialiser le nombre de lancers à 0 pour le nouveau joueur
    }

    displayCurrentPlayer();
}



function updateHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    // Récupérer le score initial sélectionné
    const pointsSelection = document.getElementById("pointsSelection");
    const selectedScore = parseInt(pointsSelection.querySelector('input[name="points"]:checked').value);

    for (let i = 0; i < playerCount; i++) {
        const playerHistory = playerHistories[i];
        const listItem = document.createElement("li");
        listItem.innerHTML = `<span class="historyPlayerName">${players[i].name} :</span>`;
        // Score initial
        let currentScore = selectedScore; // Utilisation du score initial sélectionné

        const throwGroup = document.createElement("div");
        throwGroup.classList.add("groupeLancer");
        listItem.appendChild(throwGroup);

        for (let j = 0; j < playerHistory.length; j++) {
            const entry = playerHistory[j];
            // Déduire le nombre de points de chaque lancer au score
            if (entry.points !== -1) {
                currentScore -= entry.points;
            }
            // Créer une nouvelle div tous les trois lancers
            if (j !== 0 && j % 3 === 0) {
                const newThrowGroup = document.createElement("div");
                newThrowGroup.classList.add("groupeLancer");
                listItem.appendChild(newThrowGroup);
            }
            const throwItem = document.createElement("span");
            throwItem.classList.add("lancer");
            // Afficher "à côté" pour les tirs à coté, afficher "ça dépasse" pour les tirs qui dépassent le score total
            let displayScore;
            if (entry.points === 0) {
                if (entry.label === "C") {
                    displayScore = currentScore >= 0 ? `annulé ! (${currentScore})` : "annulé";
                } else {
                    displayScore = currentScore >= 0 ? `à coté ! (${currentScore})` : "à coté";
                }
                // sinon, afficher le score
            } else if (entry.points === -1) {
                displayScore = currentScore >= 0 ? `ça dépasse !` : "ça dépasse";
            } else {
                if (entry.label === "S") {
                    displayScore = `${entry.section} (${currentScore})`;
                } else if (entry.label === "D") {
                    displayScore = `double ${entry.section} (${currentScore})`;
                } else if (entry.label === "T") {
                    displayScore = `triple ${entry.section} (${currentScore})`;
                } else {
                    displayScore = `${entry.points}`;
                }
            }
            throwItem.innerHTML = ` 
            lancer ${j + 1} : ${displayScore}
            <div class="buttonContainer"> 
                <button class="modifyButton" onclick="showScoreUpdatePopup(${i}, ${j})">
                    <img src="images/pen.svg" alt="edit">
                </button>

            </div>`;       
            // Ajouter le span à la dernière div créée
            listItem.lastChild.appendChild(throwItem);

        }
        // console.log(`joueur ${i+1} :`, playerHistory); 

        historyList.appendChild(listItem);
    }
}

{/* <button class="cancelButton" data-player="${i}" data-throw="${j}" onclick="cancelThrow(${i}, ${j})" >
<img src="images/xmark.svg" alt="delete">
</button> */}



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
// function displayUndoButton() {
//     const currentPlayer = players[currentPlayerIndex];
//     const currentPlayerHistory = playerHistories[currentPlayerIndex];
//     const undoButton = document.getElementById("undoButton");

//     if (currentPlayerHistory.length > 0 && currentPlayer.dartsThrown > 0) {
//         undoButton.style.display = "block"; // Afficher le bouton pour annuler le dernier lancer
//     } else {
//         undoButton.style.display = "none"; // Cacher le bouton s'il n'est pas possible d'annuler le dernier lancer
//     }
// }

// Afficher le button reset
function displayResetButton() {
    const resetButton = document.getElementById("reset");
    resetButton.style.display = "block";
}

// Cacher la div launcher
function hideLauncher() {
    const launcherSection = document.querySelector(".launcher");
    launcherSection.style.display = "none";
}

// Afficher la fenêtre modale de saisie du nom du joueur
function showPlayerNameSelectionPopup(playerIndex) {
    // Ajouter la classe au body pour griser le fond
    document.body.classList.add('popup-open');

    // Récupérer le score initial sélectionné
    const pointsSelection = document.getElementById("pointsSelection");
    const selectedScore = parseInt(pointsSelection.querySelector('input[name="points"]:checked').value);

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
        players.push({ id: playerIndex + 1, name: playerName, score: selectedScore, dartsThrown: 0 }); // Utilisation du score initial sélectionné
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

    // Récupérer le score initial sélectionné
    const pointsSelection = document.getElementById("pointsSelection");
    const selectedScore = parseInt(pointsSelection.querySelector('input[name="points"]:checked').value);

    // Réinitialiser les scores des joueurs, leurs historiques et le nombre de lancers
    players.forEach(player => {
        player.score = selectedScore; // Utilisation du score initial sélectionné
        player.dartsThrown = 0;
    });
    playerHistories = Array.from({ length: playerCount }, () => []);

    // Mettre à jour le tableau du score et l'historique
    updateScoreboard();
    updateHistory();
    // displayUndoButton();

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
        <button class="closePopup" onclick="closePopup()">X</button>
        <h2>Foire aux Flechettes</h2>
        <h3>Comment on commence ?</h3>
        <p>Choisissez le nombre de joueurs et appuyez sur le bouton <span class="buttonFaq">"Commencer"</span>.</p>
        <p>Choisissez le nom du ou des joueurs (Si vide on les appelera "Joueur 1", "Joueur 2", ...).</p>
        <h3>Comment on marque les points d'un lancer ?</h3>
        <p>Cliquez sur la zone de la cible correspondante, et les points apparaitront dans l'historique du joueur.</p>
        <p>Apuyez sur l'icone <img class="iconFaq" src="images/pen.svg" alt="edit"> pour modifier le score d'un lancer ou pour annuler le lancer.</p>
        <h3>A la fin de la partie on fait quoi ?</h3>
        <p>Appuyez sur <span class="buttonFaq">"Recommencer"</span> pour recommencer une partie avec les mêmes paramètres.</p>
        <p>Appuyez sur <span class="buttonFaq">"Réinitialiser"</span> pour réinitialiser la page.</p>
        <h3>Et le gros bouton <span class="buttonFaq">"Reset"</span> il sert à quoi ?</h3>
        <p>Il fait tout exploser.</p>
    `;
    
    faqPopup.appendChild(faqPopupContent);
    body.appendChild(faqPopup);
}

// Fermer la fenêtre modale (de la FAQ ou du score)
function closePopup() {
    const body = document.body;
    const faqPopup = document.querySelector('.faqPopup');
    const scorePopup = document.querySelector('.scorePopup');

    // Supprimer la classe 'popup-open' du body
    body.classList.remove('popup-open');

    // Retirer le popup de la FAQ du DOM s'il existe
    faqPopup && faqPopup.parentNode.removeChild(faqPopup);

    // Retirer le popup de score du DOM s'il existe
    scorePopup && scorePopup.parentNode.removeChild(scorePopup);
}

// Basculer entre les thèmes et enregistrer l'état dans le local storage
function toggleTheme() {
    const body = document.querySelector('body');
    body.classList.toggle('dark-theme');

    // Enregistrer l'état du thème dans le local storage
    const isDarkTheme = body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

// Récupérer l'état du thème à partir du local storage
function applyThemeFromLocalStorage() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Fonction pour mettre à jour le score en fonction de l'entrée de l'historique de lancer spécifique
function updateScore(playerIndex, throwIndex, section, multiplier, label) {

    const currentPlayer = players[playerIndex];
    const currentPlayerHistory = playerHistories[playerIndex];
    const throwEntry = currentPlayerHistory[throwIndex];

    // Calculer le score à partir de la section, du multiplicateur et du label
    let score = (label === 'S') ? section : (label === 'D' ? section * 2 : section * 3);

    // Retirer le score précédent du score du joueur
    currentPlayer.score += throwEntry.points;

    // Mettre à jour l'entrée de l'historique de lancer avec les nouvelles valeurs
    throwEntry.section = section;
    throwEntry.multiplier = multiplier;
    throwEntry.label = label;
    throwEntry.points = score;

    // Ajouter le nouveau score au score du joueur
    currentPlayer.score -= score;

    // Mettre à jour l'affichage
    updateScoreboard();
    updateHistory();
}

// Fonction pour afficher le popup de modification du score
function showScoreUpdatePopup(playerIndex, throwIndex) {
    const body = document.body;
    // Ajouter la classe 'popup-open' au body pour griser le fond
    body.classList.add('popup-open');
    const popup = createScoreUpdatePopup(playerIndex, throwIndex);
    document.body.appendChild(popup);
}

// Fonction pour créer le popup de modification du score
function createScoreUpdatePopup(playerIndex, throwIndex) {

    const playerHistory = playerHistories[playerIndex];
    const throwEntry = playerHistory[throwIndex];

    // Supprimer le popup existant s'il y en a un
    const existingPopup = document.querySelector('.scorePopup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Créer un popup pour la sélection du score
    const popup = document.createElement("div");
    popup.classList.add("scorePopup");

    //Ajout d'un titre
    const title = document.createElement("h2");
    title.textContent = "Tu veux combien ?";
    popup.appendChild(title);

    // Ajouter un bouton de fermeture
    const closeButton = document.createElement("button");
    closeButton.classList.add("closePopup");
    closeButton.textContent = "X";
    closeButton.onclick = closePopup;
    popup.appendChild(closeButton);

    // Créer une div pour contenir les div scoreGroup
    const scoreContainer = document.createElement("div");
    scoreContainer.classList.add("scoreContainer");

    // Fonction pour créer un bouton avec un événement onclick
    function createButton(text, section, multiplier, label) {
        const button = document.createElement("button");
        button.textContent = text;
        button.onclick = function() {
            // Appeler la fonction updateScore avec les paramètres appropriés
            updateScore(playerIndex, throwIndex, section, multiplier, label);
            // Fermer le popup
            closePopup();
        };
    
        // Ajout de la classe spéciale pour le bouton "ANNULÉ"
        if (label === 'C') {
            button.classList.add('specialButtonCancel');
        }
    
        return button;
    }

    // Div pour les points simples
    const simpleDiv = document.createElement("div");
    simpleDiv.classList.add("scoreGroup");
    for (let i = 1; i <= 20; i++) {
        const button = createButton(i, i, 1, 'S');
        simpleDiv.appendChild(button);
    }
    scoreContainer.appendChild(simpleDiv);

    // Div pour les points doubles
    const doubleDiv = document.createElement("div");
    doubleDiv.classList.add("scoreGroup");
    for (let i = 1; i <= 20; i++) {
        const button = createButton(`D${i}`, i, 2, 'D');
        doubleDiv.appendChild(button);
    }
    scoreContainer.appendChild(doubleDiv);

    // Div pour les points triples
    const tripleDiv = document.createElement("div");
    tripleDiv.classList.add("scoreGroup");
    for (let i = 1; i <= 20; i++) {
        const button = createButton(`T${i}`, i, 3, 'T');
        tripleDiv.appendChild(button);
    }
    scoreContainer.appendChild(tripleDiv);

    // Div pour les scores spéciaux
    const specialDiv = document.createElement("div");
    specialDiv.classList.add("scoreGroup");
    const specialButtons = [
        createButton("BULL", 25, 1, 'S'),
        createButton("BULLSEYE", 25, 2, 'D'),
        createButton("DEHORS", 0, 0, 'S'),
        createButton("ANNULER LE LANCER", 0, 0, 'C')
        
    ];
    for (const button of specialButtons) {
        specialDiv.appendChild(button);
    }

    scoreContainer.appendChild(specialDiv);
    
    // Ajouter scoreContainer au popup
    popup.appendChild(scoreContainer);
    return popup;
}

// Créer un tableau contenant les points possibles avec un double
// (2,4,6,8,10 ... 38,40 et 50)
function createDoublePointsArray() {
    const doublePointsArray = [];

    // Ajouter les points doubles de 1 à 20
    for (let i = 1; i <= 20; i++) {
        doublePointsArray.push(i * 2);
    }

    // Ajouter le Bullseye (double 25)
    doublePointsArray.push(25 * 2);

    return doublePointsArray;
}


// Vérifier si un joueur peut terminer la partie en lançant un double
function canFinishWithDouble(playerScore) {
    const doublePointsArray = createDoublePointsArray();
    return doublePointsArray.includes(playerScore);
}

