/**
 * =================================================================
 * SchreckNet Lite - V20 Character Sheet Logic
 * =================================================================
 */

// UTILITY: Populates dropdowns that have a simple, flat list of options.
// NOW FIXED: Populates ALL dropdowns with the given name.
function populateFlatDropdown(selectName, jsonPath) {
  const selects = document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      // Create the options string once
      const optionsHTML = data.map(item => `<option value="${item.value}">${item.label}</option>`).join('');
      
      // Apply to all found select elements
      selects.forEach(select => {
        select.insertAdjacentHTML('beforeend', optionsHTML);
        select.value = "";
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
}

// UTILITY: Populates dropdowns that have options grouped by <optgroup>.
// NOW FIXED: Populates ALL dropdowns with the given name.
function populateGroupedDropdown(selectName, jsonPath, optionFormatter) {
  const selects = document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      // Build the full HTML string for all optgroups and options once
      const groupsHTML = data.map(group => {
        const optionsHTML = group.options.map(item => {
          // Create a temporary option to use the formatter
          const tempOption = document.createElement('option');
          tempOption.value = item.value;
          if (optionFormatter) {
            optionFormatter(tempOption, item);
          } else {
            tempOption.textContent = item.label;
          }
          return tempOption.outerHTML;
        }).join('');
        return `<optgroup label="${group.groupLabel}">${optionsHTML}</optgroup>`;
      }).join('');
      
      // Apply to all found select elements
      selects.forEach(select => {
        select.insertAdjacentHTML('beforeend', groupsHTML);
        select.value = "";
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
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

// UTILITY: DYNAMIC DROPDOWN ROWS
/**
 * =================================================================
 * DYNAMIC ROW MANAGEMENT UTILITY
 * =================================================================
 * Initializes a section to allow adding and removing of templated rows.
 *
 * @param {object} config - The configuration object for the section.
 * @param {string} config.sectionId - The ID of the parent section.
 * @param {string} config.addButtonSelector - The selector for the "add new" button.
 * @param {string} config.rowContainerSelector - The selector for the container to add rows to.
 * @param {string} config.templateHTML - The inner HTML of a single row to be added.
 * @param {function} [config.postAddCallback] - An optional function to run after a row is added.
 */
function initializeDynamicRows(config) {
  const section = document.getElementById(config.sectionId);
  if (!section) return;

  const addButton = section.querySelector(config.addButtonSelector);
  const rowContainer = section.querySelector(config.rowContainerSelector);

  if (!addButton || !rowContainer) return;

  rowContainer.addEventListener('click', (event) => {
    if (event.target.matches('.btn-minus')) {
      // Find the closest parent wrapper to remove
      // The wrapper class is now explicitly defined in the config
      event.target.closest(config.rowWrapperSelector).remove();
    }
  });

  addButton.addEventListener('click', (event) => {
    event.preventDefault();
    const newRow = document.createElement('div');
    // Set the class from the config
    newRow.className = config.rowWrapperClass;
    newRow.innerHTML = config.templateHTML;
    rowContainer.appendChild(newRow);

    if (config.postAddCallback) {
      config.postAddCallback(newRow);
    }
  });
}

// LOGIC: Clan/Discipline Linking
/**
 * =================================================================
 * CLAN AND DISCIPLINE LOGIC
 * =================================================================
 * Links the Clan dropdown to the three Discipline dropdowns, automatically
 * populating them with the selected clan's in-clan disciplines.
 */
function initializeClanDisciplineLogic() {
  const clanSelect = document.querySelector('select[name="clan"]');
  const disciplineSelects = document.querySelectorAll('select[name="discipline"]');

  // Exit if the necessary dropdowns aren't on the page.
  if (!clanSelect || !disciplineSelects.length) return;

  // We will fetch the data once and store it here for quick access.
  let clanDisciplinesMap = {};
  let allDisciplinesList = [];

  // Use Promise.all to fetch both data files at the same time for efficiency.
  Promise.all([
    fetch('data/V20/clan_bloodline_disciplines.json').then(res => res.json()),
    fetch('data/V20/disciplines.json').then(res => res.json())
  ])
  .then(([clanDisciplineData, allDisciplinesData]) => {
    // The clan data is an array with one big object, so we grab the first element.
    clanDisciplinesMap = clanDisciplineData[0];
    allDisciplinesList = allDisciplinesData;

    // Now that the data is loaded, we can attach our event listener.
    clanSelect.addEventListener('change', handleClanChange);
    console.log("Clan and Discipline data loaded and ready.");
  })
  .catch(error => {
    console.error("Failed to load clan/discipline data:", error);
  });


  // This is the function that runs every time the user changes the clan.
  function handleClanChange() {
    const selectedClan = clanSelect.value;
    // Look up the disciplines for the selected clan. If not found, use an empty array.
    const disciplinesForClan = clanDisciplinesMap[selectedClan] || [];

    // Loop through each of the three discipline dropdowns.
    disciplineSelects.forEach((select, index) => {
      // 1. Clear all existing options except for the first placeholder.
      while (select.options.length > 1) {
        select.remove(1);
      }

      // 2. Repopulate the dropdown with the full list of all disciplines.
      allDisciplinesList.forEach(discipline => {
        const option = document.createElement('option');
        option.value = discipline.value;
        option.textContent = discipline.label;
        select.appendChild(option);
      });

      // 3. Set the dropdown's value to the specific in-clan discipline.
      const clanDiscipline = disciplinesForClan[index]; // Get the 1st, 2nd, or 3rd discipline
      if (clanDiscipline) {
        select.value = clanDiscipline;
      } else {
        // If the clan has fewer than 3 disciplines (e.g., Caitiff), reset to placeholder.
        select.value = "";
      }

      // 4. Trigger a color update on the select element (reuses your existing utility).
      // We wrap this in a helper function to ensure it exists before we call it.
      if (typeof updateSelectColor === 'function') {
        updateSelectColor(select);
      }
    });
  }
  
  // A simple helper function to reuse your existing select styling logic
  function updateSelectColor(selectElement) {
    if (selectElement.value === '') {
      selectElement.classList.add('text-textSecondary');
      selectElement.classList.remove('text-textPrimary');
    } else {
      selectElement.classList.add('text-textPrimary');
      selectElement.classList.remove('text-textSecondary');
    }
  }
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
    const currentCategorySection = changedSelect.closest('.grid > div');

    // 1. ALWAYS reset the dots for the category whose priority was just changed.
    // This cleans the slate before any other logic runs.
    resetDotsForSection(currentCategorySection);

    // 2. If a new priority was selected (i.e., not the empty placeholder),
    // check if we need to "steal" it from another category.
    if (newValue) {
      priorityDropdowns.forEach(select => {
        // Find another dropdown that was using the same priority
        if (select !== changedSelect && select.value === newValue) {
          // Reset its value to the placeholder
          select.value = ""; 
          // And reset its dots as well
          const sectionToReset = select.closest('.grid > div');
          resetDotsForSection(sectionToReset);
        }
      });
    }

    // 3. Finally, update all counters to reflect the new state.
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

  // --- Initialize UI Behavior ---
  initializeSelectElementStyling();

  // --- Initialize Dot-Based Sections ---
  initializeDotCategoryLogic(/* ... a ... */);
  initializeDotCategoryLogic(/* ... b ... */);

  // --- Initialize Linked & Dynamic Dropdowns ---
  initializeClanDisciplineLogic();

  // --- Initialize Dynamic Add/Remove Rows ---

  // A custom formatter for Merits and Flaws
  const meritFlawFormatter = (optionElement, itemData) => {
    optionElement.textContent = `${itemData.label} (${itemData.cost})`;
    optionElement.dataset.cost = itemData.cost;
  };

  // 1. Define the HTML templates for new rows
  const disciplineTemplate = `
    <div class="dots-custom">
      <div>
        <select name="discipline" class="dropdown-custom"></select>
        <button class="btn-minus">-</button>
      </div>
      <div class="dot-group">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>`;

  const backgroundTemplate = `
    <div class="dots-custom">
      <div>
        <select name="background" class="dropdown-custom"></select>
        <button class="btn-minus">-</button>
      </div>
      <div class="dot-group">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    </div>`;
  
  const meritTemplate = `
    <select name="merit" class="dropdown-custom sm:w-3/4"></select>
    <button class="btn-minus">-</button>`;

  const flawTemplate = `
    <select name="flaw" class="dropdown-custom sm:w-3/4"></select>
    <button class="btn-minus">-</button>`;

  // 2. Define a generic callback to populate and style new dropdowns
  const setupNewDropdown = (newRow, selectName, jsonPath, isGrouped, formatter) => {
    const newSelect = newRow.querySelector(`select[name="${selectName}"]`);
    if (newSelect) {
      if (isGrouped) {
        populateGroupedDropdown(selectName, jsonPath, formatter); // This will only populate the new one
      } else {
        populateFlatDropdown(selectName, jsonPath);
      }
      initializeSelectElementStyling(); // Re-apply styling to the new select
    }
  };

  // 3. Define configurations for each section
  const dynamicRowConfigs = [
    {
      sectionId: 'disciplines-backgrounds-section',
      addButtonSelector: '#add-discipline-btn',
      rowContainerSelector: '#disciplines-container',
      rowWrapperClass: 'dots-wrapper',          // Explicit class for the wrapper
      rowWrapperSelector: '.dots-wrapper',      // Explicit selector for removal
      templateHTML: disciplineTemplate,
      postAddCallback: (newRow) => setupNewDropdown(newRow, 'discipline', 'data/V20/disciplines.json', false, null)
    },
    {
      sectionId: 'disciplines-backgrounds-section',
      addButtonSelector: '#add-background-btn',
      rowContainerSelector: '#backgrounds-container',
      rowWrapperClass: 'dots-wrapper',
      rowWrapperSelector: '.dots-wrapper',
      templateHTML: backgroundTemplate,
      postAddCallback: (newRow) => setupNewDropdown(newRow, 'background', 'data/V20/backgrounds.json', false, null)
    },
    {
      sectionId: 'merits-flaws-section',
      addButtonSelector: '#add-merit-btn',
      rowContainerSelector: '#merits-container',
      rowWrapperClass: 'merit-flaw-wrapper',
      rowWrapperSelector: '.merit-flaw-wrapper',
      templateHTML: meritTemplate,
      postAddCallback: (newRow) => setupNewDropdown(newRow, 'merit', 'data/V20/merits.json', true, meritFlawFormatter)
    },
    {
      sectionId: 'merits-flaws-section',
      addButtonSelector: '#add-flaw-btn',
      rowContainerSelector: '#flaws-container',
      rowWrapperClass: 'merit-flaw-wrapper',
      rowWrapperSelector: '.merit-flaw-wrapper',
      templateHTML: flawTemplate,
      postAddCallback: (newRow) => setupNewDropdown(newRow, 'flaw', 'data/V20/flaws.json', true, meritFlawFormatter)
    }
  ];

  // 4. Initialize all of them!
  dynamicRowConfigs.forEach(config => initializeDynamicRows(config));

  // 5. Populate the initial, hard-coded dropdowns
  populateFlatDropdown('discipline', 'data/V20/disciplines.json');
  populateFlatDropdown('background', 'data/V20/backgrounds.json');
  populateGroupedDropdown('clan', 'data/V20/clan_bloodline.json');
  populateGroupedDropdown('paths', 'data/V20/paths.json');
  populateGroupedDropdown('merit', 'data/V20/merits.json', meritFlawFormatter);
  populateGroupedDropdown('flaw', 'data/V20/flaws.json', meritFlawFormatter);
  populateFlatDropdown('nature', 'data/V20/nature_demeanor.json');
  populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json');
});