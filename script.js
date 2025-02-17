document.getElementById("inputForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const userInput = document.getElementById("userInput").value;
    const outputDiv = document.getElementById("output");
    const downloadBtn = document.getElementById("downloadBtn");

    outputDiv.innerHTML = "Fetching data...";
    
    try {
        const response = await fetch("YOUR_AWS_LAMBDA_API_URL", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: userInput })
        });

        const data = await response.json();
        outputDiv.innerHTML = `<p>Result: ${data.result}</p>`;

        // Store the data for downloading
        downloadBtn.style.display = "block";
        downloadBtn.onclick = () => downloadData(data);
        
    } catch (error) {
        outputDiv.innerHTML = `<p style="color: red;">Error fetching data</p>`;
    }
});

function downloadData(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "data.json";
    link.click();
}
