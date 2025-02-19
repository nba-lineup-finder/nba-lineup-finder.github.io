document.addEventListener("DOMContentLoaded", async function() {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
    const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';
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
            const teamName = team[1]; // team[1] is the team name in the array
            const newOption = document.createElement("option");
            newOption.value = teamName;  
            newOption.textContent = teamName;
            selectMenu.appendChild(newOption);
        });

        selectMenu.disabled = false;
        fetchData(selectMenu.value); // Fetch data for first option

    } catch (error) {
        selectMenu.innerHTML = "<option>Error loading options</option>";
        console.error("Error fetching dropdown options:", error);
    }

    selectMenu.addEventListener("change", function() {
        fetchData(selectMenu.value);
    });

    async function fetchData(selectedValue) {
        outputDiv.innerHTML = "Fetching data...";
        try {
            const response = await fetch("YOUR_AWS_LAMBDA_API_URL", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selection: selectedValue })
            });

            const data = await response.json();
            outputDiv.innerHTML = `<p>Result: ${data.result}</p>`;

            // Populate player selection lists
            populatePlayerOptions(data.players);

            // Enable download button
            downloadBtn.style.display = "block";
            downloadBtn.onclick = () => downloadData(data);

        } catch (error) {
            outputDiv.innerHTML = `<p style="color: red;">Error fetching data</p>`;
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

    function updateSelections(source, target) {
        const selectedItems = Array.from(source.selectedOptions).map(opt => opt.value);
        const targetOptions = Array.from(target.options);

        // Disable selected items in the opposite list
        targetOptions.forEach(opt => {
            opt.disabled = selectedItems.includes(opt.value);
        });

        // Limit selection to 5
        if (selectedItems.length > 5) {
            alert("You can only select up to 5 players.");
            source.selectedIndex = -1; // Reset selection
        }
    }

    includeSelection.addEventListener("change", function () {
        updateSelections(includeSelection, excludeSelection);
    });

    excludeSelection.addEventListener("change", function () {
        updateSelections(excludeSelection, includeSelection);
    });

    function downloadData(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.json";
        link.click();
    }
});
