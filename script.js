document.addEventListener("DOMContentLoaded", async function () {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
    const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';
    const teamPlayersURL = 'https://f6gkdr23v2.execute-api.us-east-2.amazonaws.com/test'; // Replace with your Lambda API URL
    const selectMenu = document.getElementById("TeamSelection");
    const includeSelection = document.getElementById("includeSelection");
    const excludeSelection = document.getElementById("excludeSelection");

    selectMenu.innerHTML = "<option>Loading options...</option>";

    try {
        const response = await fetch(teamURL);
        const responseData = await response.json();
        const options = JSON.parse(responseData.body);

        selectMenu.innerHTML = ""; // Clear previous options
        options.forEach(team => {
            const teamName = team[1]; // Assuming team[1] contains the team name
            const newOption = document.createElement("option");
            newOption.value = teamName;
            newOption.textContent = teamName;
            selectMenu.appendChild(newOption);
        });

        selectMenu.disabled = false;

        // Fetch player list for the first available team
        if (selectMenu.value) {
            fetchPlayerData(selectMenu.value);
        }

    } catch (error) {
        selectMenu.innerHTML = "<option>Error loading options</option>";
        console.error("Error fetching dropdown options:", error);
    }

    // Listen for team selection changes and fetch players
    selectMenu.addEventListener("change", function () {
        fetchPlayerData(selectMenu.value);
    });

    async function fetchPlayerData(teamName) {
        outputDiv.innerHTML = "Fetching players...";
        try {
            const response = await fetch(teamPlayersURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                queryStringParameters: JSON.stringify({ 'team': teamName }) // Sending team name as parameter
            });

            const data = await response.json();
            
            if (data.players && Array.isArray(data.players)) {
                populatePlayerOptions(data.players);
                outputDiv.innerHTML = `<p>Players loaded for ${teamName}</p>`;
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
            includeSelection.appendChild(option1);

            let option2 = document.createElement("option");
            option2.value = player;
            option2.textContent = player;
            excludeSelection.appendChild(option2);
        });

        includeSelection.disabled = false;
        excludeSelection.disabled = false;
    }

    function updateSelections(source, target, limit) {
        const selectedItems = Array.from(source.selectedOptions).map(opt => opt.value);
        const targetOptions = Array.from(target.options);

        // Disable selected items in the opposite list
        targetOptions.forEach(opt => {
            opt.disabled = selectedItems.includes(opt.value);
        });

        // Limit selection if necessary
        if (limit && selectedItems.length > limit) {
            alert(`You can only select up to ${limit} players.`);
            source.selectedIndex = -1; // Reset selection
        }
    }

    includeSelection.addEventListener("change", function () {
        updateSelections(includeSelection, excludeSelection, 5); // Limit to 5 for include
    });

    excludeSelection.addEventListener("change", function () {
        updateSelections(excludeSelection, includeSelection, null); // No limit for exclude
    });

    function downloadData(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.json";
        link.click();
    }
});
