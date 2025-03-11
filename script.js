document.addEventListener("DOMContentLoaded", async function () {
    const outputDiv = document.getElementById("output");
    const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';
    const teamPlayersURL = 'https://ty0t9wa9fk.execute-api.us-east-2.amazonaws.com/test';
    const findLineupsURL = 'https://your-api-endpoint.com/find-lineups'; // <-- Replace with actual API
    const selectMenu = document.getElementById("TeamSelection");
    const includeSelection = document.getElementById("includeSelection");
    const excludeSelection = document.getElementById("excludeSelection");

    // Ensure selected players container exists
    let selectedPlayersContainer = document.getElementById("selectedPlayersContainer");
    if (!selectedPlayersContainer) {
        selectedPlayersContainer = document.createElement("div");
        selectedPlayersContainer.id = "selectedPlayersContainer";
        selectedPlayersContainer.innerHTML = `
            <div class="selected-group">
                <h3>Included Players</h3>
                <div id="selectedIncluded" class="selected-list"></div>
            </div>
            <div class="selected-group">
                <h3>Excluded Players</h3>
                <div id="selectedExcluded" class="selected-list"></div>
            </div>
            <label for="minMinutes" id="minMinutesLabel" style="display: none;">
                Minimum minutes:
                <span class="tooltip">ℹ️
                    <span class="tooltip-text">Searches for 5-man lineups that have played the selected minimum minutes or more.</span>
                </span>
            </label>
            <input type="number" id="minMinutes" min="0" value="0" style="display: none; width: 3.5em; text-align: center;">
            <button id="findLineupsBtn" style="display: none; margin-left: 10px;">Find Lineups</button>
        `;
        outputDiv.appendChild(selectedPlayersContainer);
    }

    const selectedIncludedDiv = document.getElementById("selectedIncluded");
    const selectedExcludedDiv = document.getElementById("selectedExcluded");
    const minMinutesInput = document.getElementById("minMinutes");
    const minMinutesLabel = document.getElementById("minMinutesLabel");
    const findLineupsBtn = document.getElementById("findLineupsBtn");

    let includedPlayers = new Set();
    let excludedPlayers = new Set();

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

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.body) {
                throw new Error("Invalid response: No 'body' field in JSON");
            }

            const players = JSON.parse(data.body);

            if (!players.players || !Array.isArray(players.players)) {
                throw new Error("Invalid data format: 'players' key missing or not an array");
            }

            populatePlayerOptions(players.players);
            selectedIncludedDiv.innerHTML = "";
            selectedExcludedDiv.innerHTML = "";
            includedPlayers.clear();
            excludedPlayers.clear();

            minMinutesInput.style.display = "inline-block";
            minMinutesLabel.style.display = "inline-block";
            findLineupsBtn.style.display = "inline-block";

        } catch (error) {
            outputDiv.innerHTML = `<p style="color: red;">Error fetching player data</p>`;
            console.error("Error fetching player data:", error);
        }
    }

    function populatePlayerOptions(players) {
        includeSelection.innerHTML = "";
        excludeSelection.innerHTML = "";

        // Dynamically set size to match the number of players, ensuring at least 6 rows are visible
        let selectionSize = Math.max(players.length, 6);
        includeSelection.size = selectionSize;
        excludeSelection.size = selectionSize;

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

        includeSelection.disabled = false;
        excludeSelection.disabled = false;
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
            excludedPlayers.add(player);
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
            } else {
                excludedPlayers.delete(player);
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
    }

    findLineupsBtn.addEventListener("click", async function () {
		if (includedPlayers.size === 0 && excludedPlayers.size === 0) {
			alert("You must include at least one included or excluded player.");
			return;
		}

		const requestData = {
			team: selectMenu.value,
			included_players: Array.from(includedPlayers),
			excluded_players: Array.from(excludedPlayers),
			min_minutes: parseInt(minMinutesInput.value, 10) || 0
		};

		const loadingIndicator = document.getElementById("loadingIndicator");
		const outputDiv = document.getElementById("output");
		const downloadBtn = document.getElementById("downloadBtn");

		try {
			// Clear previous output
			outputDiv.innerHTML = "";
			downloadBtn.style.display = "none";

			// Show loading indicator & disable button
			findLineupsBtn.disabled = true;
			loadingIndicator.style.display = "block";

			const findLineupsURL = "https://5ybwp5gdkf.execute-api.us-east-2.amazonaws.com/test"; 
			const response = await fetch(findLineupsURL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestData)
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			const csvData = await response.text();  // Assuming API returns CSV as plain text
			console.log("CSV Data:", csvData);

			// Convert CSV to table & display
			outputDiv.innerHTML = generateTableFromCSV(csvData);
			downloadBtn.style.display = "block";

			// Store CSV data for download
			downloadBtn.onclick = () => downloadCSV(csvData);

		} catch (error) {
			console.error("Error fetching data:", error);
			alert("Failed to fetch lineup data. Please try again.");
		} finally {
			// Hide loading indicator & re-enable button
			findLineupsBtn.disabled = false;
			loadingIndicator.style.display = "none";
		}
	});

// Converts CSV to HTML table
	function generateTableFromCSV(csv) {
		const rows = csv.trim().split("\n").map(row => row.split(","));
		let tableHTML = "<table border='1' style='width:100%; text-align:center; border-collapse:collapse;'>";

		rows.forEach((row, index) => {
			tableHTML += `<tr style="background-color:${index === 0 ? '#ddd' : '#fff'};">`;
			row.forEach(cell => tableHTML += `<td>${cell.trim()}</td>`);
			tableHTML += "</tr>";
		});

		tableHTML += "</table>";
		return tableHTML;
	}

	// Download CSV file
	function downloadCSV(csvData) {
		const blob = new Blob([csvData], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "lineup_data.csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

});
