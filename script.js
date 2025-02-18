document.addEventListener("DOMContentLoaded", async function() {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
	const teamURL = 'https://9acy441201.execute-api.us-east-2.amazonaws.com/test';

    const selectMenu = document.getElementById("TeamSelection");
    selectMenu.innerHTML = "<option>Loading options...</option>";

    try {
        const response = await fetch(teamURL);
        const options = await response.json();

        selectMenu.innerHTML = ""; // Clear previous options
       options.forEach(team => {
            const teamName = team[1]; // team[1] is the team name in the array
            const newOption = document.createElement("option");
            newOption.value = teamName;  // Use the team name for the value
            newOption.textContent = teamName;  // Set the displayed name as the team name
            selectMenu.appendChild(newOption);
        });

        selectMenu.disabled = false;

        // Trigger the API call immediately with the first loaded option
        fetchData(selectMenu.value);

    } catch (error) {
        selectMenu.innerHTML = "<option>Error loading options</option>";
        console.error("Error fetching dropdown options:", error);
    }

    // Listen for changes in the dropdown selection and fetch data
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

            // Store the data for downloading
            downloadBtn.style.display = "block";
            downloadBtn.onclick = () => downloadData(data);

        } catch (error) {
            outputDiv.innerHTML = `<p style="color: red;">Error fetching data</p>`;
        }
    }

    function downloadData(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "data.json";
        link.click();
    }
});
