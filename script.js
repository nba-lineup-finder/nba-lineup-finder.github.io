document.addEventListener("DOMContentLoaded", async function() {
    const TeamSelection = document.getElementById("TeamSelection");
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
	
	
	function populateDropdown() {
    fetch(https://9acy441201.execute-api.us-east-2.amazonaws.com/test)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Clear the current options (for when the data is loaded)
        dropdown.innerHTML = '';

        // Optionally, add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an option';
        dropdown.appendChild(defaultOption);

        // Loop through the API data and add it as options
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;  // Assuming the API response has an 'id' for each item
          option.textContent = item.name;  // Assuming the API response has a 'name' for each item
          dropdown.appendChild(option);
        });
      })
      .catch(error => {
        console.error('There was an error fetching the data:', error);
        dropdown.innerHTML = '<option value="">Failed to load options</option>';
      });
  }

  // Call the function to populate the dropdown
  populateDropdown();
});
