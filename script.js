document.addEventListener("DOMContentLoaded", async function () {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
    const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';
    const teamPlayersURL = 'https://ty0t9wa9fk.execute-api.us-east-2.amazonaws.com/test';
    const selectMenu = document.getElementById("TeamSelection");
    const includeSelection = document.getElementById("includeSelection");
    const excludeSelection = document.getElementById("excludeSelection");

    const selectedIncludedDiv = document.getElementById("selectedIncluded");
    const selectedExcludedDiv = document.getElementById("selectedExcluded");

    let includedPlayers = new Set();

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
                selectedIncludedDiv.innerHTML = "";
                selectedExcludedDiv.innerHTML = "";
                includedPlayers.clear();
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
            option1.addEventListener("click", () => moveToSelected(player, "include"));

            let option2 = document.createElement("option");
            option2.value = player;
            option2.textContent = player;
            option2.addEventListener("click", () => moveToSelected(player, "exclude"));

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

    function moveToSelected(player, category) {
        if (document.getElementById(`selected-${CSS.escape(player)}`)) return;

        if (category === "include" && includedPlayers.size >= 5) {
            alert("You can only include up to 5 players.");
            return;
        }

        const selectedDiv = document.createElement("div");
        selectedDiv.className = "selected-player";
        selectedDiv.id = `selected-${CSS.escape(player)}`;
        selectedDiv.innerHTML = `
            ${player} <button class="remove-player" onclick="restorePlayer('${player.replace(/'/g, "\\'")}', '${category}')">✖</button>
        `;

        if (category === "include") {
            selectedIncludedDiv.appendChild(selectedDiv);
            includedPlayers.add(player);
        } else {
            selectedExcludedDiv.appendChild(selectedDiv);
        }

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

    window.restorePlayer = function (player, category) {
        const playerDiv = document.getElementById(`selected-${CSS.escape(player)}`);
        if (playerDiv) {
            playerDiv.remove();
            if (category === "include") {
                includedPlayers.delete(player);
            }
            addBackToSelections(player);
        }
    };

    function addBackToSelections(player) {
        let option1 = document.createElement("option");
        option1.value = player;
        option1.textContent = player;
        option1.addEventListener("click", () => moveToSelected(player, "include"));

        let option2 = document.createElement("option");
        option2.value = player;
        option2.textContent = player;
        option2.addEventListener("click", () => moveToSelected(player, "exclude"));

        includeSelection.appendChild(option1);
        excludeSelection.appendChild(option2);

        adjustSize(includeSelection);
        adjustSize(excludeSelection);
    }
});
