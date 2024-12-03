// URLs for your Google Sheets (Direct CSV Export Links)
const lostItemsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlIICj2LjtAj6bwD5nRo3Jv7pHi3-3Q5YIqtrNPWRMHq_7UKoOOhcY_sn9t4Gy7RtylhD8X1l2NtH8/pub?gid=1252712457&single=true&output=csv";
const foundItemsSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHb2riWeWsfMxOZ8xpbTADJvkc5wcLazMb0Sxer2thHUYkDZ8N7-hclzvRj0g8tNeDNvL6ElKH620x/pub?gid=1838931110&single=true&output=csv";

// Arrays to hold the fetched lost and found items
let lostItemsData = [];
let foundItemsData = [];

async function fetchData(sheetURL, containerId, isLostItems = true) {
    try {
        const response = await fetch(sheetURL); // Fetch data directly from Google Sheets
        if (!response.ok) throw new Error("Failed to fetch data");

        const text = await response.text(); // Get CSV data as text
        const rows = text.split("\n").slice(1); // Skip the header row

        // Filter and parse items that have meaningful data
        const filteredRows = rows.filter(row => {
            const columns = row.split(",").map(col => col.trim());
            return columns.length >= 7 && columns[1] && columns[3] && columns[1] !== "Unnamed User" && columns[3] !== "No description available";
        });

        // Parse and generate HTML for valid items
        const content = filteredRows
            .map(row => {
                const columns = row.split(",").map(col => col.trim());
                if (columns.length >= 7) {
                    const [dateTime, name, contactInfo, description, dateLost, locationLost, imageUrl] = columns;

                    const item = {
                        name: name || "Unnamed User",
                        contactInfo: contactInfo || "No contact provided",
                        description: description || "No description available",
                        dateLost: dateLost || "Not provided",
                        locationLost: locationLost || "Not provided",
                    };

                    // Store the items in their respective arrays
                    if (isLostItems) {
                        lostItemsData.push(item);
                    } else {
                        foundItemsData.push(item);
                    }

                    return `
                        <div class="item">
                            <h3>${item.name}</h3>
                            <p><strong>Contact Information:</strong> ${item.contactInfo}</p>
                            <p><strong>Description:</strong> ${item.description}</p>
                            <p><strong>Date:</strong> ${item.dateLost}</p>
                            <p><strong>Location:</strong> ${item.locationLost}</p>
                        </div>
                    `;
                }
                return '';
            })
            .join("");

        document.getElementById(containerId).innerHTML = content || "<p>No items found.</p>";

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById(containerId).innerHTML = "<p>Error loading data.</p>";
    }
}


// Function to check for description matches
// Function to check for description matches
function checkMatch() {
    const matchedItems = [];

    // Compare lost and found items by description
    lostItemsData.forEach((lostItem) => {
        foundItemsData.forEach((foundItem) => {
            if (lostItem.description.toLowerCase() === foundItem.description.toLowerCase()) {
                matchedItems.push({
                    lostItem: lostItem,
                    foundItem: foundItem
                });
            }
        });
    });

    // Display match notification
    const notification = document.getElementById("notification");
    const matchedItemElement = document.getElementById("matched-item");

    if (matchedItems.length > 0) {
        let matchedItemText = "Matched Items:\n";
        matchedItems.forEach((match) => {
            matchedItemText += `
                Lost Item: ${match.lostItem.name} (Description: ${match.lostItem.description})
                Found Item: ${match.foundItem.name} (Description: ${match.foundItem.description})
                ----------------------------
            `;
        });
        matchedItemElement.textContent = matchedItemText;
        notification.style.display = "block";
    } else {
        notification.style.display = "none";
        alert("No matches found!");
    }
}

// Fetch data for both lost and found items
fetchData(lostItemsSheetURL, "lost-items-container", true);
fetchData(foundItemsSheetURL, "found-items-container", false);

// Add event listener for the 'Check Match' button
document.getElementById('check-match-button').addEventListener('click', checkMatch);