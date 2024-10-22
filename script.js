// script.js

// Initialisation des équipes de Ligue 1, de leurs niveaux et de leurs capitaines
const teams = [
    {
        name: 'Paris Saint-Germain',
        level: 5,
        color: '#004170',
        players: ['Marquinhos'] // Capitaine
    },
    {
        name: 'Olympique de Marseille',
        level: 5,
        color: '#009DEC',
        players: ['Dimitri Payet']
    },
    {
        name: 'Olympique Lyonnais',
        level: 4,
        color: '#D60021',
        players: ['Léo Dubois']
    },
    {
        name: 'AS Monaco',
        level: 4,
        color: '#C8102E',
        players: ['Wissam Ben Yedder']
    },
    {
        name: 'Lille OSC',
        level: 4,
        color: '#D50032',
        players: ['José Fonte']
    },
    {
        name: 'Stade Rennais',
        level: 3,
        color: '#E00000',
        players: ['Hamari Traoré']
    },
    {
        name: 'OGC Nice',
        level: 3,
        color: '#E2001A',
        players: ['Dante']
    },
    {
        name: 'Montpellier HSC',
        level: 2,
        color: '#F47920',
        players: ['Téji Savanier']
    },
    {
        name: 'RC Strasbourg',
        level: 2,
        color: '#0053A0',
        players: ['Dimitri Liénard']
    },
    {
        name: 'FC Nantes',
        level: 2,
        color: '#FFE600',
        players: ['Alban Lafont']
    },
    {
        name: 'Stade Brestois',
        level: 2,
        color: '#EF0007',
        players: ['Brendan Chardonnet']
    },
    {
        name: 'Angers SCO',
        level: 1,
        color: '#000000',
        players: ['Ismaël Traoré']
    },
    {
        name: 'FC Lorient',
        level: 1,
        color: '#FF7F00',
        players: ['Fabien Lemoine']
    },
    {
        name: 'Stade de Reims',
        level: 1,
        color: '#FF0000',
        players: ['Yunis Abdelhamid']
    },
    {
        name: 'RC Lens',
        level: 3,
        color: '#FFCC00',
        players: ['Seko Fofana']
    },
    {
        name: 'Clermont Foot',
        level: 1,
        color: '#003366',
        players: ['Florent Ogier']
    },
    {
        name: 'ESTAC Troyes',
        level: 1,
        color: '#005CA9',
        players: ['Jimmy Giraudon']
    },
    {
        name: 'FC Metz',
        level: 1,
        color: '#8B0000',
        players: ['John Boye']
    },
    {
        name: 'Girondins de Bordeaux',
        level: 2,
        color: '#000080',
        players: ['Laurent Koscielny']
    },
    {
        name: 'AS Saint-Étienne',
        level: 2,
        color: '#008000',
        players: ['Mahdi Camara']
    }
];

// Variables globales
let balance = parseFloat(localStorage.getItem('balance')) || 100;
let history = JSON.parse(localStorage.getItem('history')) || [];
let matchData = JSON.parse(localStorage.getItem('matchData')) || [];
let gameState = localStorage.getItem('gameState') || 'playing'; // 'playing', 'final', 'finished'
let selectedTeam = null;
let selectedOdds = 0;
let selectedMatch = null;

// Au chargement de la page
window.onload = function() {
    updateBalance();
    updateHistory();
    initNavigation();
    if (matchData.length === 0) {
        generateMatches();
    }
    displayMatch();
    displayPreviousScores();
};

// Génération des matchs
function generateMatches() {
    matchData = [];

    // Générer les matchs en limitant le nombre total de matchs
    const totalMatches = 40; // Par exemple, 40 matchs
    let possibleMatches = [];

    // Générer toutes les combinaisons possibles
    for (let i = 0; i < teams.length - 1; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            possibleMatches.push({
                team1: teams[i],
                team2: teams[j],
                round: 1,
                score: null,
                result: null,
                odds1: calculateOdds(teams[i], teams[j]),
                odds2: calculateOdds(teams[j], teams[i])
            });
        }
    }

    // Mélanger les matchs possibles
    possibleMatches.sort(() => Math.random() - 0.5);

    // Sélectionner les matchs pour la compétition
    matchData = possibleMatches.slice(0, totalMatches);

    localStorage.setItem('matchData', JSON.stringify(matchData));
}

// Calcul des cotes en fonction du niveau des équipes
function calculateOdds(teamA, teamB) {
    let levelDifference = teamB.level - teamA.level;
    let baseOdds = 1.5 + (levelDifference * 0.5);
    if (baseOdds < 1.1) baseOdds = 1.1;
    return baseOdds.toFixed(2);
}

// Mise à jour du solde
function updateBalance() {
    document.getElementById('balance').textContent = balance.toFixed(2);
    localStorage.setItem('balance', balance);
}

// Mise à jour de l'historique
function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    history.forEach(function(entry) {
        const listItem = document.createElement('li');
        listItem.className = 'history-item';
        listItem.innerHTML = entry;
        historyList.appendChild(listItem);
    });

    localStorage.setItem('history', JSON.stringify(history));
}

// Affichage du match actuel
function displayMatch() {
    const matchContainer = document.getElementById('match-container');
    matchContainer.innerHTML = '';

    if (gameState === 'playing') {
        // Trouver le prochain match sans résultat
        selectedMatch = matchData.find(m => m.result === null);
        if (!selectedMatch) {
            // Passer à la finale
            prepareFinal();
            return;
        }

        const matchDiv = createMatchDiv(selectedMatch);
        matchContainer.appendChild(matchDiv);
    } else if (gameState === 'final') {
        selectedMatch = matchData.find(m => m.round === 'final');
        if (!selectedMatch.result) {
            const matchDiv = createMatchDiv(selectedMatch);
            matchContainer.appendChild(matchDiv);
        } else {
            displayWinner();
        }
    } else if (gameState === 'finished') {
        displayWinner();
    }
}

// Création de l'élément de match
function createMatchDiv(match) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';

    // Teams
    const teamsDiv = document.createElement('div');
    teamsDiv.className = 'teams';

    const team1Div = document.createElement('div');
    team1Div.className = 'team';
    team1Div.onclick = function() {
        showTeamPlayers(match.team1);
    };

    const team1Name = document.createElement('span');
    team1Name.className = 'team-name';
    team1Name.textContent = match.team1.name;
    team1Name.style.color = match.team1.color;

    team1Div.appendChild(team1Name);

    const vsSpan = document.createElement('span');
    vsSpan.textContent = ' vs ';

    const team2Div = document.createElement('div');
    team2Div.className = 'team';
    team2Div.onclick = function() {
        showTeamPlayers(match.team2);
    };

    const team2Name = document.createElement('span');
    team2Name.className = 'team-name';
    team2Name.textContent = match.team2.name;
    team2Name.style.color = match.team2.color;

    team2Div.appendChild(team2Name);

    teamsDiv.appendChild(team1Div);
    teamsDiv.appendChild(vsSpan);
    teamsDiv.appendChild(team2Div);

    // Bet buttons
    const betButtonsDiv = document.createElement('div');
    betButtonsDiv.className = 'bet-buttons';

    const betButton1 = document.createElement('button');
    betButton1.className = 'bet-button';
    betButton1.textContent = `Parier sur ${match.team1.name} (${match.odds1})`;
    betButton1.onclick = function() {
        openBetModal(match.team1, match.odds1);
    };

    const betButton2 = document.createElement('button');
    betButton2.className = 'bet-button';
    betButton2.textContent = `Parier sur ${match.team2.name} (${match.odds2})`;
    betButton2.onclick = function() {
        openBetModal(match.team2, match.odds2);
    };

    betButtonsDiv.appendChild(betButton1);
    betButtonsDiv.appendChild(betButton2);

    matchDiv.appendChild(teamsDiv);
    matchDiv.appendChild(betButtonsDiv);

    return matchDiv;
}

// Ouvrir la modale de pari
function openBetModal(team, odds) {
    selectedTeam = team;
    selectedOdds = odds;

    // Mettre à jour le contenu de la modale
    document.getElementById('modal-team-name').textContent = `Parier sur ${team.name} (Cote : ${odds})`;
    document.getElementById('bet-amount-input').value = '';

    // Afficher la modale
    document.getElementById('bet-modal').style.display = 'block';
}

// Fermer la modale de pari
function closeBetModal() {
    document.getElementById('bet-modal').style.display = 'none';
}

// Fonction pour afficher un message personnalisé dans une modale avec des boutons personnalisés
function showMessageModal(title, message, buttons) {
    document.getElementById('message-modal-title').textContent = title;
    document.getElementById('message-modal-text').textContent = message;

    const buttonsContainer = document.getElementById('message-modal-buttons');
    buttonsContainer.innerHTML = '';

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.onclick = function() {
            closeMessageModal();
            if (button.action) button.action();
        };
        buttonsContainer.appendChild(btn);
    });

    document.getElementById('message-modal').style.display = 'block';
}

// Fermer la modale de message
function closeMessageModal() {
    document.getElementById('message-modal').style.display = 'none';
}

// Gestionnaires d'événements pour la modale de message
document.getElementById('close-message-modal').addEventListener('click', closeMessageModal);

// Confirmer le pari
function confirmBet() {
    let betAmount = parseFloat(document.getElementById('bet-amount-input').value);

    if (isNaN(betAmount) || betAmount <= 0) {
        showMessageModal('Erreur', "Veuillez entrer un montant valide supérieur à 0.", [{ text: 'OK' }]);
        return;
    }
    if (betAmount > balance) {
        showMessageModal('Erreur', "Vous n'avez pas assez de FED¤ pour ce pari.", [{ text: 'OK' }]);
        return;
    }

    // Déduction de la mise du solde
    balance -= betAmount;

    // Simulation du match
    let winningTeam = simulateMatch(selectedMatch);

    if (selectedTeam.name === winningTeam.name) {
        let winnings = betAmount * selectedOdds;
        balance += winnings;
        let message = `Bravo ! ${selectedTeam.name} a gagné ! Vous remportez ${winnings.toFixed(2)} FED¤.`;
        history.unshift(`✅ Gagné : Mise de ${betAmount.toFixed(2)} FED¤ sur ${selectedTeam.name} (Cote : ${selectedOdds}), gain de ${(winnings - betAmount).toFixed(2)} FED¤.`);
        showMessageModal('Victoire !', message, [{ text: 'OK' }]);
    } else {
        let message = `Dommage... ${selectedTeam.name} a perdu. Vous avez perdu ${betAmount.toFixed(2)} FED¤.`;
        history.unshift(`❌ Perdu : Mise de ${betAmount.toFixed(2)} FED¤ sur ${selectedTeam.name} (Cote : ${selectedOdds}), perte de ${betAmount.toFixed(2)} FED¤.`);
        showMessageModal('Défaite', message, [{ text: 'OK' }]);
    }

    // Mise à jour du match
    selectedMatch.result = winningTeam.name;
    selectedMatch.score = generateMatchScore(selectedMatch.team1, selectedMatch.team2, winningTeam);
    localStorage.setItem('matchData', JSON.stringify(matchData));

    updateBalance();
    updateHistory();
    displayMatch();
    displayPreviousScores();

    // Fermer la modale après le pari
    closeBetModal();

    // Vérifier si le solde est épuisé
    if (balance <= 0) {
        showMessageModal('Solde épuisé', "Votre solde est épuisé. Voulez-vous recevoir un bonus de 100 FED¤ ?", [
            { text: 'Oui', action: () => { balance = 100; updateBalance(); } },
            { text: 'Non' }
        ]);
    }
}

// Simuler un match
function simulateMatch(match) {
    let probTeam1 = match.team1.level / (match.team1.level + match.team2.level);
    let randomOutcome = Math.random();
    return randomOutcome < probTeam1 ? match.team1 : match.team2;
}

// Générer le score d'un match en fonction du niveau des équipes
function generateMatchScore(team1, team2, winningTeam) {
    let baseGoals = 2;
    let goalDifference = Math.abs(team1.level - team2.level);
    let team1Goals, team2Goals;

    if (winningTeam.name === team1.name) {
        team1Goals = baseGoals + goalDifference;
        team2Goals = baseGoals - goalDifference;
    } else {
        team1Goals = baseGoals - goalDifference;
        team2Goals = baseGoals + goalDifference;
    }

    // Empêcher les buts négatifs
    if (team1Goals < 0) team1Goals = 0;
    if (team2Goals < 0) team2Goals = 0;

    return `${team1Goals} - ${team2Goals}`;
}

// Afficher les scores précédents
function displayPreviousScores() {
    const scoresList = document.getElementById('scores-list');
    scoresList.innerHTML = '';

    matchData.filter(m => m.result !== null && m !== selectedMatch).forEach(match => {
        const listItem = document.createElement('li');
        listItem.textContent = `${match.team1.name} ${match.score} ${match.team2.name}`;
        scoresList.appendChild(listItem);
    });
}

// Préparer la finale
function prepareFinal() {
    gameState = 'final';
    localStorage.setItem('gameState', gameState);

    // Calculer les scores des équipes
    let teamScores = {};
    teams.forEach(team => {
        teamScores[team.name] = 0;
    });

    matchData.forEach(match => {
        if (match.result === match.team1.name) {
            teamScores[match.team1.name] += 3; // Victoire
        } else if (match.result === match.team2.name) {
            teamScores[match.team2.name] += 3; // Victoire
        } else {
            // Égalité (non prévu ici, mais au cas où)
            teamScores[match.team1.name] += 1;
            teamScores[match.team2.name] += 1;
        }
    });

    // Trier les équipes par score décroissant
    let sortedTeams = Object.keys(teamScores).sort((a, b) => teamScores[b] - teamScores[a]);

    if (sortedTeams.length >= 2) {
        let finalTeams = [
            teams.find(team => team.name === sortedTeams[0]),
            teams.find(team => team.name === sortedTeams[1])
        ];

        let finalMatch = {
            team1: finalTeams[0],
            team2: finalTeams[1],
            round: 'final',
            score: null,
            result: null,
            odds1: calculateOdds(finalTeams[0], finalTeams[1]),
            odds2: calculateOdds(finalTeams[1], finalTeams[0])
        };
        matchData.push(finalMatch);
        localStorage.setItem('matchData', JSON.stringify(matchData));
        displayMatch();
    } else {
        // Pas assez d'équipes pour une finale
        gameState = 'finished';
        localStorage.setItem('gameState', gameState);
        displayWinner();
    }
}

// Afficher le vainqueur
function displayWinner() {
    const winnerMatch = matchData.find(m => m.round === 'final');
    let winner;

    if (winnerMatch && winnerMatch.result) {
        winner = winnerMatch.result;
    } else {
        winner = teams[0].name; // Par défaut si pas de finale
    }

    // Mettre à jour le contenu de la modale de victoire
    document.getElementById('victory-message').textContent = `Le vainqueur final est ${winner} !`;

    // Afficher la modale de victoire
    document.getElementById('victory-modal').style.display = 'block';

    // Lancer les confettis
    launchConfetti();
}

// Fermer la modale de victoire
function closeVictoryModal() {
    document.getElementById('victory-modal').style.display = 'none';
    resetGame();
}

// Gestionnaire d'événement pour le bouton de fermeture de la modale de victoire
document.getElementById('close-victory-button').addEventListener('click', closeVictoryModal);

// Lancer les confettis
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const myConfetti = confetti.create(canvas, { resize: true });

    var duration = 5 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
        var timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        myConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0, 1), y: Math.random() - 0.2 } }));
    }, 250);
}

// Réinitialiser le jeu
function resetGame() {
    showMessageModal('Réinitialisation', 'Voulez-vous vraiment réinitialiser le jeu ?', [
        { text: 'Confirmer', action: () => { localStorage.clear(); location.reload(); } },
        { text: 'Annuler' }
    ]);
}

// Afficher les joueurs d'une équipe (ici les capitaines)
function showTeamPlayers(team) {
    document.getElementById('team-modal-name').textContent = `Capitaine de ${team.name}`;
    const playersList = document.getElementById('team-players-list');
    playersList.innerHTML = '';

    team.players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = player;
        playersList.appendChild(listItem);
    });

    // Afficher la modale
    document.getElementById('team-modal').style.display = 'block';
}

// Fermer la modale des joueurs
function closeTeamModal() {
    document.getElementById('team-modal').style.display = 'none';
}

// Navigation entre les onglets
function initNavigation() {
    document.getElementById('nav-matches').addEventListener('click', function() {
        document.getElementById('matches-section').style.display = 'block';
        document.getElementById('history-section').style.display = 'none';
        this.classList.add('active');
        document.getElementById('nav-history').classList.remove('active');
    });

    document.getElementById('nav-history').addEventListener('click', function() {
        document.getElementById('matches-section').style.display = 'none';
        document.getElementById('history-section').style.display = 'block';
        this.classList.add('active');
        document.getElementById('nav-matches').classList.remove('active');
    });
}

// Gestionnaires d'événements pour la modale de pari
document.getElementById('close-modal').addEventListener('click', closeBetModal);
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('bet-modal')) {
        closeBetModal();
    }
});
document.getElementById('confirm-bet-button').addEventListener('click', confirmBet);

// Gestionnaires d'événements pour la modale des joueurs
document.getElementById('close-team-modal').addEventListener('click', closeTeamModal);
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('team-modal')) {
        closeTeamModal();
    }
});

// Ajout de l'événement pour le bouton "Passer le match"
document.getElementById('skip-match-button').addEventListener('click', function() {
    skipMatch();
});

// Fonction pour passer le match
function skipMatch() {
    // Simuler le match sans pari
    let winningTeam = simulateMatch(selectedMatch);

    // Mise à jour du match
    selectedMatch.result = winningTeam.name;
    selectedMatch.score = generateMatchScore(selectedMatch.team1, selectedMatch.team2, winningTeam);
    localStorage.setItem('matchData', JSON.stringify(matchData));

    // Vérifier si tous les matchs ont été joués
    let remainingMatches = matchData.filter(m => m.result === null);
    if (remainingMatches.length === 0 && gameState === 'playing') {
        prepareFinal();
    } else if (gameState === 'final' && !selectedMatch.result) {
        displayWinner();
    } else {
        displayMatch();
        displayPreviousScores();
    }
}

// Gestionnaires d'événements pour la modale de message (fermeture en cliquant à l'extérieur)
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('message-modal')) {
        closeMessageModal();
    }
});