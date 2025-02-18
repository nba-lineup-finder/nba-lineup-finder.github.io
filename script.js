document.addEventListener("DOMContentLoaded", async function() {
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");
	const teamURL = 'https://www.balldontlie.io/api/v1/teams';

    try {
        const response = await fetch("YOUR_API_FOR_OPTIONS"); // Replace with actual API URL
        const options = await response.json();

        selectMenu.innerHTML = ""; // Clear previous options
        options.forEach(option => {
            const newOption = document.createElement("option");
            newOption.value = option.value;  // Adjust based on API response format
            newOption.textContent = option.label;
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
	
	
		// Function to fetch data and populate the dropdown
	function getTeamsDropdown(apiUrl) {
    // Fetch data from the API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Get the dropdown element by its ID
            const dropdown = document.getElementById('document.getElementById("TeamSelection");');

            // Clear the initial "Loading..." option
            dropdown.innerHTML = '';

            // Iterate through the API response data (array of options)
            data.forEach(item => {
                // Each item is an array like ["team_name", "Team Name"]
                const teamName = item[1]; // The team name is the second item in the array

                // Create a new <option> element for each team name
                const optionElement = document.createElement('option');
                optionElement.value = teamName; // The value of the option
                optionElement.textContent = teamName; // The text displayed in the dropdown

                // Append the option to the dropdown
                dropdown.appendChild(optionElement);
            });
        })
        .catch(error => {
            console.error('There was an error with the fetch operation:', error);

            // Handle error by adding an error message to the dropdown
            const dropdown = document.getElementById('dropdown');
            dropdown.innerHTML = '<option value="">Failed to load options</option>';
        });
	}

	// Call the function to populate the dropdown
	getTeamsDropdown('https://9acy441201.execute-api.us-east-2.amazonaws.com/test');

});
