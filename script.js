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
        selectMenu.innerHTML = "<option>Error loading options</option>. Try refreshing site.";
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

	  // Wrap the requestData inside a "body" field and stringify it
	  const payload = {
		body: JSON.stringify(requestData)
	  };

	  const loadingIndicator = document.getElementById("loadingIndicator");
	  const outputDiv = document.getElementById("output");
	  const downloadBtn = document.getElementById("downloadBtn");

	  try {
		outputDiv.style.display = "block";
		downloadBtn.style.display = "none";

		// Show loading indicator & disable button
		findLineupsBtn.disabled = true;
		loadingIndicator.style.display = "block";

		minMinutesInput.style.display = "inline-block";
		minMinutesLabel.style.display = "inline-block";	
		findLineupsBtn.style.display = "inline-block";

		const findLineupsURL = "https://5ybwp5gdkf.execute-api.us-east-2.amazonaws.com/test"; 
		const response = await fetch(findLineupsURL, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify(payload)  // Send the wrapped "body" field
		});

		if (!response.ok) {
		  throw new Error(`API error: ${response.status} ${response.statusText}`);
		}

		const lineupResponse = await response.text();
		const lineupData = JSON.parse(lineupResponse);

		const headerElement = document.createElement("p");
		headerElement.innerHTML = `
		  <h3>${lineupData.header}</h3>
		  <span style="font-size: 0.8em; color: gray;">${lineupData.last_update}</span>
		  <br><br>
		`;

		// if already have table, remove it
		const existingHeader = outputDiv.querySelector("p"); // Assuming header is inside a <p> tag
		const existingTable = outputDiv.querySelector("table"); // Assuming table is inside a <table> tag
		const existingPagination = outputDiv.querySelector(".pagination"); // For pagination controls
		if (existingHeader) existingHeader.remove();
		if (existingTable) existingTable.remove();
		if (existingPagination) existingPagination.remove();

		// Insert the header element at the start of outputDiv
		outputDiv.insertBefore(headerElement, outputDiv.firstChild);

		// Pagination variables
		const rowsPerPage = 20;
		let currentPage = 1;
		const rows = lineupData.csv.trim().split("\n").map(row => row.split(",").map(cell => cell.trim()));

		// Function to create table
		function createTable(rowsToDisplay) {
		  const table = document.createElement("table");
		  table.setAttribute("border", "1");
		  table.style.width = "100%";
		  table.style.textAlign = "center";
		  table.style.borderCollapse = "collapse";

		  const thead = document.createElement("thead");
		  const headerRow = document.createElement("tr");
		  const headers = rows[0]; // Header row from CSV data

		  // Create the table header
		  headers.forEach(cell => {
			const th = document.createElement("th");
			th.textContent = cell; // Using textContent to avoid XSS vulnerabilities
			headerRow.appendChild(th);
		  });
		  thead.appendChild(headerRow);
		  table.appendChild(thead);

		  const tbody = document.createElement("tbody");
		  rowsToDisplay.forEach(row => {
			const tr = document.createElement("tr");
			row.forEach(cell => {
			  const td = document.createElement("td");
			  td.textContent = cell; // Using textContent to avoid XSS vulnerabilities
			  tr.appendChild(td);
			});
			tbody.appendChild(tr);
		  });
		  table.appendChild(tbody);
		  return table;
		}

		// Function to render the current page
		function renderPage(page) {
		  const start = (page - 1) * rowsPerPage + 1;
		  const end = Math.min(start + rowsPerPage - 1, rows.length - 1);

		  const rowsToDisplay = rows.slice(start, end + 1);
		  const table = createTable(rowsToDisplay);
		  outputDiv.appendChild(table);
		}

		// Function to create pagination controls
		function createPaginationControls() {
		  const paginationDiv = document.createElement("div");
		  paginationDiv.classList.add("pagination");

		  const totalPages = Math.ceil((rows.length - 1) / rowsPerPage);

		  // Previous button
		  if (currentPage > 1) {
			const prevButton = document.createElement('button');
			prevButton.textContent = 'Prev';
			prevButton.addEventListener('click', () => {
			  currentPage--;
			  outputDiv.innerHTML = ''; // Clear current content
			  outputDiv.appendChild(headerElement); // Re-add header
			  renderPage(currentPage);
			  createPaginationControls(); // Re-create pagination controls
			});
			paginationDiv.appendChild(prevButton);
		  }

		  // Page number
		  const pageNumber = document.createElement('span');
		  pageNumber.textContent = ` Page ${currentPage} of ${totalPages} `;
		  paginationDiv.appendChild(pageNumber);

		  // Next button
		  if (currentPage < totalPages) {
			const nextButton = document.createElement('button');
			nextButton.textContent = 'Next';
			nextButton.addEventListener('click', () => {
			  currentPage++;
			  outputDiv.innerHTML = ''; // Clear current content
			  outputDiv.appendChild(headerElement); // Re-add header
			  renderPage(currentPage);
			  createPaginationControls(); // Re-create pagination controls
			});
			paginationDiv.appendChild(nextButton);
		  }

		  outputDiv.appendChild(paginationDiv);
		}

		// Render the first page and pagination controls
		renderPage(currentPage);
		createPaginationControls();

		// Show download button and handle download
		downloadBtn.style.display = "block";
		downloadBtn.onclick = () => downloadCSV(lineupData.csv);

	  } catch (error) {
		console.error("Error fetching data:", error);

		// Show error message in output div, but don't hide the button
		outputDiv.innerHTML = `
		  <p style="color: red; font-weight: bold;">⚠️ Error: ${error.message}</p>
		  <p>Please try again or check your selections.</p>
		`;
		outputDiv.style.display = "block";

		// Ensure button and div are still visible
		findLineupsBtn.disabled = false;
		loadingIndicator.style.display = "none";
	  } finally {
		// Hide loading indicator & re-enable button (even on error)
		findLineupsBtn.disabled = false;
		loadingIndicator.style.display = "none";
	  }
	});



	function generateTableFromCSV(csvText) {
	  // Split into rows and trim whitespace
	  const rows = csvText.trim().split("\n").map(row => row.split(",").map(cell => cell.trim()));

	  // Create a table element
	  const table = document.createElement("table");
	  table.setAttribute("border", "1");
	  table.style.width = "100%";
	  table.style.textAlign = "center";
	  table.style.borderCollapse = "collapse";

	  // Create the header row
	  const thead = document.createElement("thead");
	  const headerRow = document.createElement("tr");
	  const headers = rows[0];

	  // Find the index of the "NRTG" column
	  const nrtgColumnIndex = headers.indexOf('NRTG');

	  headers.forEach(cell => {
		const th = document.createElement("th");
		th.textContent = cell; // Using textContent to avoid XSS vulnerabilities
		headerRow.appendChild(th);
	  });
	  thead.appendChild(headerRow);
	  table.appendChild(thead);

	  // Create the body rows
	  const tbody = document.createElement("tbody");
	  rows.slice(1).forEach(row => {
		const tr = document.createElement("tr");
		row.forEach((cell, index) => {
		  const td = document.createElement("td");
		  td.textContent = cell; // Using textContent to avoid XSS vulnerabilities

		  // Check if this is the "NRTG" column and style the cell accordingly
		  if (index === nrtgColumnIndex) {
			const number = parseFloat(cell);
			if (number >= 0) {
			  td.classList.add('positive-nrtg'); // Positive numbers in green
			} else {
			  td.classList.add('negative-nrtg'); // Negative numbers in red
			}
		  }

		  tr.appendChild(td);
		});
		tbody.appendChild(tr);
	  });
	  table.appendChild(tbody);

	  // Return the table DOM element
	  return table;
	}



// Escapes HTML special characters to prevent injection
function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
