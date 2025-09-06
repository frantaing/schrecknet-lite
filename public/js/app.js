/**
 * =================================================================
 * SchreckNet Lite - V20 Character Sheet Logic
 * =================================================================
 */

// UTILITY: Populates dropdowns that have a simple, flat list of options.
// For: Nature, Demeanor, Disciplines, Backgrounds.
function populateFlatDropdown(selectName, jsonPath) {
  const selects = document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return; // Exit if no select elements found

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      selects.forEach(select => {
        // Create and append an option for each item in the JSON data
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value;
          option.textContent = item.label;
          select.appendChild(option);
        });
        // Reset to the placeholder after populating
        select.value = "";
      });
    })
    .catch(error => {
      console.error(`Error fetching data for [${selectName}] from ${jsonPath}:`, error);
      selects.forEach(select => {
        select.innerHTML = '<option value="">Error loading</option>';
      });
    });
}

// UTILITY: Populates dropdowns that have options grouped by <optgroup>.
// For: Clans, Paths, Merits, Flaws.
// The `optionFormatter`: customize how each <option> is created. = Merits & Flaws.
function populateGroupedDropdown(selectName, jsonPath, optionFormatter) {
  const select = document.querySelector(`select[name="${selectName}"]`);
  if (!select) return; // Exit if the select element isn't found

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Loop through each group in the JSON (e.g., "Clans", "Bloodlines")
      data.forEach(group => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.groupLabel;

        // Loop through the options within that group
        group.options.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value;

          // If a custom formatter function is provided, use it.
          // Otherwise, use the default behavior.
          if (optionFormatter && typeof optionFormatter === 'function') {
            optionFormatter(option, item);
          } else {
            option.textContent = item.label; // Default formatting
          }

          optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
      });
      // Reset to the placeholder after populating
      select.value = "";
    })
    .catch(error => {
      console.error(`Error fetching data for [${selectName}] from ${jsonPath}:`, error);
      select.innerHTML = '<option value="">Error loading</option>';
    });
}

// UTILITY: Dynamically styles <select> elements to show a placeholder color.
function initializeSelectElementStyling() {
  const allSelects = document.querySelectorAll('select');

  const updateSelectColor = (selectElement) => {
    // Tailwind Classes
    if (selectElement.value === '') {
      selectElement.classList.add('text-textSecondary');
      selectElement.classList.remove('text-textPrimary');
    } else {
      selectElement.classList.add('text-textPrimary');
      selectElement.classList.remove('text-textSecondary');
    }
  };

  allSelects.forEach(select => {
    // Set initial color on page load
    updateSelectColor(select);
    // Add event listener to update color on change
    select.addEventListener('change', (event) => {
      updateSelectColor(event.currentTarget);
    });
  });
}

// --- Main Application Setup ---
// This single event listener is the entry point for all initialization code.
document.addEventListener('DOMContentLoaded', () => {

  // A custom formatter function specifically for Merits and Flaws.
  // It adds the cost to the text and stores it in a data attribute.
  const meritFlawFormatter = (optionElement, itemData) => {
    optionElement.textContent = `${itemData.label} (${itemData.cost})`;
    optionElement.dataset.cost = itemData.cost; // for calculations later
  };

  // --- Populate All Dropdowns ---
  // Flat Dropdowns
  populateFlatDropdown('nature', 'data/V20/nature_demeanor.json');
  populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json');
  populateFlatDropdown('discipline', 'data/V20/disciplines.json');
  populateFlatDropdown('background', 'data/V20/backgrounds.json');

  // Grouped Dropdowns
  populateGroupedDropdown('clan', 'data/V20/clan_bloodline.json');
  populateGroupedDropdown('paths', 'data/V20/paths.json');
  populateGroupedDropdown('merit', 'data/V20/merits.json', meritFlawFormatter);
  populateGroupedDropdown('flaw', 'data/V20/flaws.json', meritFlawFormatter);

  // --- Initialize UI Behavior ---
  initializeSelectElementStyling();

  // Add dot-handling initialization here later!
  // e.g., initializeDotInteractivity();

});