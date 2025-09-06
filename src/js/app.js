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

// LOGIC: Dot-Attributes
function initializeAttributeLogic() {
  const attributeSections = document.querySelectorAll('.grid.gap-16 > div');
  const priorityDropdowns = document.querySelectorAll('select[name="attribute-priority"]');

  const priorityPoints = {
    primary: 7,
    secondary: 5,
    tertiary: 3,
  };

  /**
   * Updates the displayed point counters for all three attribute categories.
   */
  const updateCounters = () => {
    attributeSections.forEach(section => {
      const dropdown = section.querySelector('select[name="attribute-priority"]');
      const counterSpan = section.querySelector('h4 span');
      
      const priority = dropdown.value;
      const allocatedPoints = priorityPoints[priority] || 0;

      // Each of the 3 attributes starts with 1 free dot.
      const basePoints = 3; 
      const filledDots = section.querySelectorAll('.dot.filled').length;
      const spentPoints = filledDots - basePoints;
      
      const remainingPoints = allocatedPoints - spentPoints;

      // Update the UI
      counterSpan.textContent = `(${remainingPoints}/${allocatedPoints})`;

      // Optional: Add styling for when points are overspent
      if (remainingPoints < 0) {
        counterSpan.classList.add('text-accent');
      } else {
        counterSpan.classList.remove('text-accent');
      }
    });
  };

  /**
   * Handles a click on any dot. Fills/unfills dots in a "waterfall" manner.
   */
  const handleDotClick = (event) => {
    const clickedDot = event.target;
    // Only proceed if a dot was actually clicked
    if (!clickedDot.matches('.dot')) return;

    const dotGroup = clickedDot.closest('.dot-group');
    const allDotsInGroup = Array.from(dotGroup.querySelectorAll('.dot'));
    const clickedIndex = allDotsInGroup.indexOf(clickedDot);

    // Determine the new "score" for this attribute row.
    // If clicking the currently last filled dot, unfill it (score decreases by 1).
    // Otherwise, the new score is the index of the clicked dot + 1.
    const isLastFilledDot = clickedDot.classList.contains('filled') && (allDotsInGroup[clickedIndex + 1] === undefined || !allDotsInGroup[clickedIndex + 1].classList.contains('filled'));
    const newScore = isLastFilledDot ? clickedIndex : clickedIndex + 1;

    // Update the visuals for all dots in this group based on the new score
    allDotsInGroup.forEach((dot, index) => {
      // The first dot (index 0) is the freebie point and cannot be unfilled.
      if (index < newScore || index === 0) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
    
    // After changing dots, update the main counters
    updateCounters();
  };

  /**
   * Manages the priority dropdowns to ensure a priority can only be selected once.
   */
  const handlePriorityChange = () => {
    const selectedValues = Array.from(priorityDropdowns)
                                .map(select => select.value)
                                .filter(value => value !== '');

    priorityDropdowns.forEach(select => {
      Array.from(select.options).forEach(option => {
        if (option.value !== '' && selectedValues.includes(option.value) && select.value !== option.value) {
          option.disabled = true;
        } else {
          option.disabled = false;
        }
      });
    });
    
    // After changing priorities, update the main counters
    updateCounters();
  };

  // --- INITIALIZATION ---
  
  // 1. Set up initial dot states and add click listeners
  attributeSections.forEach(section => {
    const dotGroups = section.querySelectorAll('.dot-group');
    dotGroups.forEach(group => {
      const firstDot = group.querySelector('.dot');
      // Hard-code the first dot as filled by default
      if (firstDot) {
        firstDot.classList.add('filled');
      }
    });
    // Use event delegation for efficiency
    section.addEventListener('click', handleDotClick);
  });
  
  // 2. Add change listeners to dropdowns
  priorityDropdowns.forEach(select => {
    select.addEventListener('change', handlePriorityChange);
  });
  
  // 3. Perform an initial counter update on page load
  updateCounters();
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
  
  // Dot Interactivity
  initializeAttributeLogic(); // Attributes

});