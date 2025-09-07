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
/**
 * =================================================================
 * REUSABLE DOT INTERACTIVITY LOGIC
 * =================================================================
 * This function can initialize any section that uses dots and priorities
 * (e.g., Attributes, Abilities).
 *
 * @param {string} sectionId - The ID of the main <section> element.
 * @param {string} prioritySelectName - The 'name' attribute of the priority dropdowns.
 * @param {object} priorityPointsConfig - An object mapping priorities to point values.
 * @param {number} baseDotsPerItem - The number of "free" dots each item starts with (e.g., 1 for Attributes, 0 for Abilities).
 */
function initializeDotCategoryLogic(sectionId, prioritySelectName, priorityPointsConfig, baseDotsPerItem, maxDotsPerItem) {
  const mainSection = document.getElementById(sectionId);
  if (!mainSection) return; // Exit if the section doesn't exist on the page

  const categorySections = mainSection.querySelectorAll('.grid > div');
  const priorityDropdowns = mainSection.querySelectorAll(`select[name="${prioritySelectName}"]`);

  const resetDotsForSection = (categoryElement) => {
    const dotGroups = categoryElement.querySelectorAll('.dot-group');
    dotGroups.forEach(group => {
      group.querySelectorAll('.dot').forEach((dot, index) => {
        // Use the baseDotsPerItem parameter to determine the default state
        if (index < baseDotsPerItem) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    });
  };

  const updateCounters = () => {
    categorySections.forEach(category => {
      const dropdown = category.querySelector(`select[name="${prioritySelectName}"]`);
      const counterSpan = category.querySelector('h4 span');
      const priority = dropdown.value;
      const allocatedPoints = priorityPointsConfig[priority] || 0;
      
      const totalBasePoints = category.querySelectorAll('.dot-group').length * baseDotsPerItem;
      const filledDots = category.querySelectorAll('.dot.filled').length;
      const spentPoints = filledDots - totalBasePoints;
      const remainingPoints = allocatedPoints - spentPoints;

      counterSpan.textContent = `(${remainingPoints}/${allocatedPoints})`;
      counterSpan.classList.toggle('text-accent', remainingPoints < 0);
    });
  };
  
  const handlePriorityChange = (event) => {
    const changedSelect = event.target;
    const newValue = changedSelect.value;
    if (!newValue) {
      updateCounters();
      return;
    }
    priorityDropdowns.forEach(select => {
      if (select !== changedSelect && select.value === newValue) {
        select.value = "";
        const sectionToReset = select.closest('.grid > div');
        resetDotsForSection(sectionToReset);
      }
    });
    updateCounters();
  };

  const handleDotClick = (event) => {
    const clickedDot = event.target;
    if (!clickedDot.matches('.dot')) return; // Exit if not a dot

    const category = clickedDot.closest('.grid > div');
    const dropdown = category.querySelector(`select[name="${prioritySelectName}"]`);
    const priority = dropdown.value;
    const dotGroup = clickedDot.closest('.dot-group');

    // Guard Clause #1: Priority Check
    if (!priority) {
      console.warn("Cannot assign dots: Please select a priority first.");
      return;
    }

    if (isTryingToSpend(clickedDot)) {
      // --- NEW GUARD CLAUSE #2: MAX DOTS PER ITEM RULE ---
      const dotsInGroup = Array.from(dotGroup.children);
      const clickedDotIndex = dotsInGroup.indexOf(clickedDot);
      const newScore = clickedDotIndex + 1; // The score the user is trying to set

      // The maxDotsPerItem parameter is a number. If it's provided and the new
      // score exceeds it, we deny the action and exit the function.
      if (maxDotsPerItem && newScore > maxDotsPerItem) {
        console.warn(`Action denied: Abilities cannot be raised above ${maxDotsPerItem} during character creation.`);
        return; // STOP
      }
      // --- END NEW GUARD CLAUSE ---

      // Guard Clause #3: Do we have enough points for the cost?
      const cost = calculateClickCost(dotGroup, clickedDot);
      const remainingPoints = calculateRemainingPoints(category, priority);
      if (cost > remainingPoints) {
        console.warn(`Action denied: Costs ${cost}, but only ${remainingPoints} left.`);
        return;
      }
    }
    
    // If all guards are passed, proceed with the update
    updateDotsInGroup(dotGroup, clickedDot);
    updateCounters();
  };

  // Helper sub-functions for handleDotClick
  const isTryingToSpend = (dot) => !dot.classList.contains('filled');
  const calculateClickCost = (group, dot) => (Array.from(group.children).indexOf(dot) + 1) - group.querySelectorAll('.filled').length;
  const calculateRemainingPoints = (category, priority) => {
    const allocated = priorityPointsConfig[priority] || 0;
    const totalBase = category.querySelectorAll('.dot-group').length * baseDotsPerItem;
    const filled = category.querySelectorAll('.dot.filled').length;
    return allocated - (filled - totalBase);
  };
  const updateDotsInGroup = (group, dot) => {
    const dots = Array.from(group.children);
    const clickIndex = dots.indexOf(dot);
    const isLastFilled = dot.classList.contains('filled') && !dots[clickIndex + 1]?.classList.contains('filled');
    const newScore = isLastFilled ? clickIndex : clickIndex + 1;
    dots.forEach((d, i) => d.classList.toggle('filled', i < newScore || i < baseDotsPerItem));
  };
  
  // --- INITIALIZATION ---
  categorySections.forEach(category => {
    resetDotsForSection(category); // Set initial state
    category.addEventListener('click', handleDotClick);
  });
  priorityDropdowns.forEach(select => select.addEventListener('change', handlePriorityChange));
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
  
  // --- Initialize Dot-Based Sections ---

  // Configuration for Attributes
  initializeDotCategoryLogic(
    'attributes-section',
    'attribute-priority',
    { primary: 7, secondary: 5, tertiary: 3 },
    1, // Attributes start with 1 free dot
    5 // Attributes can be raised up to 5 (max)
  );

  // Configuration for Abilities
  initializeDotCategoryLogic(
    'abilities-section',
    'ability-priority',
    { primary: 13, secondary: 9, tertiary: 5 },
    0, // Abilities start with 0 free dots
    3 // V20: Abilities can only be raised up to 3 with initial points
  );

});