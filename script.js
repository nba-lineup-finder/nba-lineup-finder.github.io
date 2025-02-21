document.addEventListener("DOMContentLoaded", async function () {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
    const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';
    const teamPlayersURL = 'https://ty0t9wa9fk.execute-api.us-east-2.amazonaws.com/test';
    const selectMenu = document.getElementById("TeamSelection");
    const includeSelection = document.getElementById("includeSelection");
    const excludeSelection = document.getElementById("excludeSelection");
    const selectedPlayersDiv = document.createElement("div");
    selectedPlayersDiv.id = "selectedPlayers";
    outputDiv.appendChild(selectedPlayersDiv);

    selectMenu.innerHTML = "<option>Loading options...</option>";

    try {
        const response = await fetch(teamURL);
        const responseData = await response.json();
        const options = JSON.parse(responseData.body);

        selectMenu.innerHTML = ""; 
        options.forEach(team => {
            const teamName = team[1];
            const newOption = document.createElement("option");
            newOption.value = teamName;
            newOption.textContent = teamName;
            selectMenu.appendChild(newOption);
        });

        selectMenu.disabled = false;

        if (selectMenu.value) {
            fetchPlayerData(selectMenu.value);
        }

    } catch (error) {
        selectMenu.innerHTML = "<option>Error loading options</option>";
        console.error("Error fetching dropdown options:", error);
    }

    selectMenu.addEventListener("change", function () {
        fetchPlayerData(selectMenu.value);
    });

    async function fetchPlayerData(teamName) {
        try {
            const response = await fetch(`${teamPlayersURL}?team=${encodeURIComponent(teamName)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            const players = JSON.parse(data.body);

            if (players.players && Array.isArray(players.players)) {
                populatePlayerOptions(players.players);
                selectedPlayersDiv.innerHTML = ""; 
            } else {
                outputDiv.innerHTML = `<p style="color: red;">No players found for ${teamName}</p>`;
            }

        } catch (error) {
            outputDiv.innerHTML = `<p style="color: red;">Error fetching player data</p>`;
            console.error("Error fetching player data:", error);
        }
    }

    function populatePlayerOptions(players) {
        includeSelection.innerHTML = "";
        excludeSelection.innerHTML = "";

        players.forEach(player => {
            let option1 = document.createElement("option");
            option1.value = player;
            option1.textContent = player;
            option1.addEventListener("click", () => moveToSelected(player));

            let option2 = document.createElement("option");
            option2.value = player;
            option2.textContent = player;
            option2.addEventListener("click", () => moveToSelected(player));

            includeSelection.appendChild(option1);
            excludeSelection.appendChild(option2);
        });

        adjustSize(includeSelection);
        adjustSize(excludeSelection);

        includeSelection.disabled = false;
        excludeSelection.disabled = false;
    }

    function adjustSize(selectElement) {
        selectElement.size = Math.max(6, selectElement.options.length);
    }

    function moveToSelected(player) {
        if (document.getElementById(`selected-${player}`)) return; 

        const selectedPlayerDiv = document.createElement("div");
        selectedPlayerDiv.className = "selected-player";
        selectedPlayerDiv.id = `selected-${player}`;
        selectedPlayerDiv.innerHTML = `
            ${player} <button class="remove-player" onclick="restorePlayer('${player}')">X</button>
        `;

        selectedPlayersDiv.appendChild(selectedPlayerDiv);

        removeFromSelections(player);
    }

    function removeFromSelections(player) {
        [includeSelection, excludeSelection].forEach(select => {
            [...select.options].forEach(option => {
                if (option.value === player) {
                    option.remove();
                }
            });
        });
    }

    window.restorePlayer = function (player) {
        const playerDiv = document.getElementById(`selected-${player}`);
        if (playerDiv) {
            playerDiv.remove();
            addBackToSelections(player);
        }
    };

    function addBackToSelections(player) {
        let option1 = document.createElement("option");
        option1.value = player;
        option1.textContent = player;
        option1.addEventListener("click", () => moveToSelected(player));

        let option2 = document.createElement("option");
        option2.value = player;
        option2.textContent = player;
        option2.addEventListener("click", () => moveToSelected(player));

        includeSelection.appendChild(option1);
        excludeSelection.appendChild(option2);

        adjustSize(includeSelection);
        adjustSize(excludeSelection);
    }
});
