/**
 * =================================================================
 * SchreckNet Lite - V20 Character Sheet Logic
 * =================================================================
 */

// UTILITY: Populates one or all dropdowns with a given name.
function populateFlatDropdown(selectName, jsonPath, targetSelect = null) {
  const selects = targetSelect ? [targetSelect] : document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const optionsHTML = data.map(item => `<option value="${item.value}">${item.label}</option>`).join('');
      selects.forEach(select => {
        // Clear old options before adding new ones (but keep placeholder)
        const placeholder = select.querySelector('option[disabled]');
        select.innerHTML = '';
        if (placeholder) select.appendChild(placeholder);
        
        select.insertAdjacentHTML('beforeend', optionsHTML);
        if (!targetSelect) select.value = ""; // Only reset initial dropdowns on page load
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
}

// UTILITY: Populates one or all grouped dropdowns with a given name.
function populateGroupedDropdown(selectName, jsonPath, optionFormatter, targetSelect = null) {
  const selects = targetSelect ? [targetSelect] : document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const groupsHTML = data.map(group => {
        const optionsHTML = group.options.map(item => {
          const tempOption = document.createElement('option');
          tempOption.value = item.value;
          if (optionFormatter) optionFormatter(tempOption, item);
          else tempOption.textContent = item.label;
          return tempOption.outerHTML;
        }).join('');
        return `<optgroup label="${group.groupLabel}">${optionsHTML}</optgroup>`;
      }).join('');

      selects.forEach(select => {
        const placeholder = select.querySelector('option[disabled]');
        select.innerHTML = '';
        if (placeholder) select.appendChild(placeholder);

        select.insertAdjacentHTML('beforeend', groupsHTML);
        if (!targetSelect) select.value = "";
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
}

// UTILITY: Can style ALL selects, OR a single specific one.
function initializeSelectElementStyling(targetElement = null) {
  const allSelects = targetElement ? [targetElement] : document.querySelectorAll('select');
  
  const updateSelectColor = (selectElement) => {
    if (selectElement.value === '') {
      selectElement.classList.add('text-textSecondary');
      selectElement.classList.remove('text-textPrimary');
    } else {
      selectElement.classList.add('text-textPrimary');
      selectElement.classList.remove('text-textSecondary');
    }
  };

  allSelects.forEach(select => {
    updateSelectColor(select);
    select.addEventListener('change', (event) => updateSelectColor(event.currentTarget));
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
      // The selector for what to remove is passed in the config.
      event.target.closest(config.rowWrapperSelector).remove();
    }
  });

  addButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    // 1. Create the main wrapper element using the class from the config.
    //    This ensures there is ALWAYS have a .dots-wrapper or .merit-flaw-wrapper.
    const newRow = document.createElement('div');
    newRow.className = config.rowWrapperClass;

    // 2. Set the inner HTML of this wrapper to be the template.
    newRow.innerHTML = config.templateHTML;
    
    // 3. Insert the fully-formed, correctly wrapped row into the DOM.
    rowContainer.insertBefore(newRow, addButton.parentElement);

    // 4. Run the callback if it exists.
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
  // NOTE: No longer select the discipline dropdowns here.

  if (!clanSelect) return;

  let clanDisciplinesMap = {};
  let allDisciplinesList = [];

  Promise.all([
    fetch('data/V20/clan_bloodline_disciplines.json').then(res => res.json()),
    fetch('data/V20/disciplines.json').then(res => res.json())
  ])
  .then(([clanDisciplineData, allDisciplinesData]) => {
    clanDisciplinesMap = clanDisciplineData[0];
    allDisciplinesList = allDisciplinesData;
    clanSelect.addEventListener('change', handleClanChange);
    console.log("Clan and Discipline data loaded and ready.");
  })
  .catch(error => console.error("Failed to load clan/discipline data:", error));

  function handleClanChange() {
    // --- DOT, ROW, AND COUNTER CLEANUP STEP ---
    const disciplinesContainer = document.getElementById('disciplines-container');
    if (disciplinesContainer) {
      // 1. Remove all dynamically added discipline rows.
      disciplinesContainer.querySelectorAll('.dots-wrapper').forEach(row => {
        if (row.querySelector('.btn-minus')) row.remove();
      });
      
      // 2. Reset dots in the remaining (permanent) rows.
      disciplinesContainer.querySelectorAll('.dot').forEach(dot => dot.classList.remove('filled'));
      
      // --- NEW: RESET THE COUNTER ---
      // Find the counter in the disciplines section and reset it to its initial value.
      const disciplineCounter = document.querySelector('#disciplines-section h3 span');
      if (disciplineCounter) {
        disciplineCounter.textContent = '3'; // Initial point pool for Disciplines
        disciplineCounter.classList.remove('text-accent');
      }
      // --- END OF NEW CODE ---
    }

    const disciplineSelects = document.querySelectorAll('select[name="discipline"]');
    const selectedClan = clanSelect.value;
    const disciplinesForClan = clanDisciplinesMap[selectedClan] || [];

    disciplineSelects.forEach((select, index) => {
      // The rest of the logic for populating dropdowns stays the same...
      const placeholder = select.querySelector('option[disabled]');
      select.innerHTML = '';
      if (placeholder) select.appendChild(placeholder);
      
      allDisciplinesList.forEach(discipline => {
        const option = document.createElement('option');
        option.value = discipline.value;
        option.textContent = discipline.label;
        select.appendChild(option);
      });

      const clanDiscipline = disciplinesForClan[index];
      select.value = clanDiscipline || "";
      
      if (typeof updateSelectColor === 'function') {
        updateSelectColor(select);
      }
    });
  }
  
  // updateSelectColor helper, just in case
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

// LOGIC: Fixed point dot-handling
/**
 * =================================================================
 * UPGRADED: SIMPLE DOT & POINT POOL LOGIC (Disciplines, Backgrounds, etc.)
 * =================================================================
 * Handles dot-filling and manages a simple point pool for a given section.
 * NOW WITH MUTATION OBSERVER TO DETECT ROW REMOVALS.
 *
 * @param {string} sectionId - The ID of the specific section div to manage.
 * @param {string} selectName - The 'name' attribute of the dropdowns in this section.
 * @param {number} pointPool - The total number of points available for this section.
 * @param {number} baseDotsPerItem - The number of "free" dots each item starts with.
 */
function initializeSimpleDotLogic(sectionId, selectName, pointPool, baseDotsPerItem) {
  const mainSection = document.getElementById(sectionId);
  if (!mainSection) return;

  const counterSpan = mainSection.querySelector('h3 span');
  const rowContainer = mainSection.querySelector('.flex.flex-col.gap-3'); // The container that holds the rows

  // --- COUNTER UPDATE LOGIC ---
  const updateCounter = () => {
    const filledDots = mainSection.querySelectorAll('.dot.filled').length;
    const spentPoints = filledDots - (mainSection.querySelectorAll('.dot-group').length * baseDotsPerItem);
    const remainingPoints = pointPool - spentPoints;
    
    if (counterSpan) {
      counterSpan.textContent = remainingPoints;
      counterSpan.classList.toggle('text-accent', remainingPoints < 0);
    }
    return remainingPoints;
  };

  // --- DOT CLICK HANDLER (with cost calculation) ---
  const handleDotClick = (event) => {
    const clickedDot = event.target;
    if (!clickedDot.matches('.dot')) return;

    const dotGroup = clickedDot.closest('.dot-group');
    const wrapper = clickedDot.closest('.dots-wrapper'); // The parent row

    // GUARD 1: Dropdown must have a value.
    if (wrapper) {
      const select = wrapper.querySelector(`select[name="${selectName}"]`);
      if (select && !select.value) {
        console.warn("Action denied: Please select an item before assigning dots.");
        return;
      }
    }
    
    // GUARD 2: Cannot spend more points than available.
    if (!clickedDot.classList.contains('filled')) {
      const currentScore = dotGroup.querySelectorAll('.dot.filled').length;
      const newScore = Array.from(dotGroup.children).indexOf(clickedDot) + 1;
      const cost = newScore - currentScore;
      const remainingPoints = updateCounter();
      if (cost > remainingPoints) {
        console.warn(`Action denied: Costs ${cost}, but only ${remainingPoints} left.`);
        return;
      }
    }

    updateDotsInGroup(dotGroup, clickedDot);
    updateCounter();
  };
  
  // Helper to update a single dot group
  const updateDotsInGroup = (group, clickedDot) => {
    const dots = Array.from(group.children);
    const clickIndex = dots.indexOf(clickedDot);
    const isLastFilled = clickedDot.classList.contains('filled') && !dots[clickIndex + 1]?.classList.contains('filled');
    const newScore = isLastFilled ? clickIndex : clickIndex + 1;
    dots.forEach((d, i) => d.classList.toggle('filled', i < newScore || i < baseDotsPerItem));
  };

  // --- DROPDOWN CHANGE HANDLER ---
  const handleDropdownChange = (event) => {
    const changedSelect = event.target;
    if (changedSelect.matches(`select[name="${selectName}"]`)) {
      const wrapper = changedSelect.closest('.dots-wrapper');
      if (wrapper) {
        const dotGroup = wrapper.querySelector('.dot-group');
        if (dotGroup) {
          Array.from(dotGroup.children).forEach((dot, index) => {
            dot.classList.toggle('filled', index < baseDotsPerItem);
          });
          updateCounter();
        }
      }
    }
  };

  // --- INITIALIZATION ---
  mainSection.addEventListener('click', handleDotClick);
  mainSection.addEventListener('change', handleDropdownChange);
  
  // --- NEW: OBSERVER FOR ROW REMOVAL ---
  // This watches for changes inside the row container.
  if (rowContainer) {
    const observer = new MutationObserver((mutationsList) => {
      // Loop through all the mutations that just happened.
      for (const mutation of mutationsList) {
        // Only care about mutations where nodes were REMOVED.
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          // A row was removed! Recalculate the points.
          console.log('A row was removed. Updating points.');
          updateCounter();
          // Found it!, no need to check other mutations.
          break; 
        }
      }
    });

    // Tell the observer to watch the container and notify of child changes.
    observer.observe(rowContainer, { childList: true });
  }
  // --- END OF NEW CODE ---

  updateCounter(); // Initial counter setup on page load
}

// LOGIC: Dynamic point dot-handling
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
    // check if need to "steal" it from another category.
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
      // score exceeds it, deny the action and exit the function.
      if (maxDotsPerItem && newScore > maxDotsPerItem) {
        console.warn(`Action denied: Abilities cannot be raised above ${maxDotsPerItem} during character creation.`);
        return; // STOP
      }
      // --- END NEW GUARD CLAUSE ---

      // Guard Clause #3: Does user have enough points for the cost?
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

  // --- MERIT/FLAW FORMATTER ---
  const meritFlawFormatter = (optionElement, itemData) => {
    optionElement.textContent = `${itemData.label} (${itemData.cost})`;
    optionElement.dataset.cost = itemData.cost;
  };

  // --- TEMPLATES FOR DYNAMIC ROWS ---
  const disciplineTemplate = `
    <div class="dots-custom">
      <div class="relative flex items-center justify-center group ml-10 gap-2">
        <select name="discipline" class="dropdown-custom"><option value="" disabled selected hidden>discipline</option></select>
        <button class="btn-minus">-</button>
      </div>
      <div class="dot-group"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
  `;
  const backgroundTemplate = `
    <div class="dots-custom">
      <div class="relative flex items-center justify-center group ml-10 gap-2">
        <select name="background" class="dropdown-custom"><option value="" disabled selected hidden>background</option></select>
        <button class="btn-minus">-</button>
      </div>
      <div class="dot-group"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
  `;
  const meritTemplate = `
    <div class="merit-flaw-wrapper relative flex items-center justify-center group ml-10 gap-2">
      <select name="merit" class="dropdown-custom">
        <option value="" disabled selected hidden>merit</option>
      </select>
      <button class="btn-minus">-</button>
    </div>
  `;
  const flawTemplate = `
    <div class="merit-flaw-wrapper relative flex items-center justify-center group ml-10 gap-2">
      <select name="flaw" class="dropdown-custom">
          <option value="" disabled selected hidden>flaw</option>
      </select>
      <button class="btn-minus">-</button>         
    </div>
  `;

  // --- CALLBACK FOR NEWLY ADDED DROPDOWNS ---
  const setupNewDropdown = (newRow, selectName, jsonPath, isGrouped, formatter) => {
    const newSelect = newRow.querySelector(`select[name="${selectName}"]`);
    if (newSelect) {
      // The logic is now explicit for each case to avoid argument mismatch
      if (isGrouped) {
        // This call has 4 arguments, which is correct for populateGroupedDropdown
        populateGroupedDropdown(selectName, jsonPath, formatter, newSelect);
      } else {
        // This call has 3 arguments, which is correct for populateFlatDropdown
        populateFlatDropdown(selectName, jsonPath, newSelect);
      }
      initializeSelectElementStyling(newSelect); // ONLY style the new select element
    }
  };

  // --- CONFIGURATIONS ---
  const dynamicRowConfigs = [
    {
      sectionId: 'disciplines-backgrounds-section',
      addButtonSelector: '#add-discipline-btn',
      rowContainerSelector: '#disciplines-container',
      rowWrapperClass: 'dots-wrapper',
      rowWrapperSelector: '.dots-wrapper',
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

  // --- INITIALIZE ALL PAGE FEATURES (The Correct Order) ---

  // 1. Populate all the dropdowns that exist when the page first loads.
  populateFlatDropdown('discipline', 'data/V20/disciplines.json'); // CORRECT
  populateFlatDropdown('background', 'data/V20/backgrounds.json'); // CORRECT
  populateGroupedDropdown('merit', 'data/V20/merits.json', meritFlawFormatter); // CORRECT
  populateGroupedDropdown('flaw', 'data/V20/flaws.json', meritFlawFormatter); // CORRECT
  populateGroupedDropdown('clan', 'data/V20/clan_bloodline.json', null); // CORRECT
  populateGroupedDropdown('paths', 'data/V20/paths.json', null); // CORRECT
  populateFlatDropdown('nature', 'data/V20/nature_demeanor.json'); // CORRECT
  populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json'); // CORRECT
  
  // 2. Initialize all the dynamic and interactive logic.
  initializeSelectElementStyling();
  initializeClanDisciplineLogic();
  dynamicRowConfigs.forEach(config => initializeDynamicRows(config));
  
  // 3. Initialize dyamic dot logic
  initializeDotCategoryLogic('attributes-section', 'attribute-priority', { primary: 7, secondary: 5, tertiary: 3 }, 1, 5);
  initializeDotCategoryLogic('abilities-section', 'ability-priority', { primary: 13, secondary: 9, tertiary: 5 }, 0, 3);

  // 4. Initialize fixed dot logic
  initializeSimpleDotLogic('disciplines-section', 'discipline', 3, 0);
  initializeSimpleDotLogic('backgrounds-section', 'background', 5, 0);
});