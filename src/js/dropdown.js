/**
 * =================================================================
 * Dropdown Helpers
 * =================================================================
 * Handles populating dropdowns from JSON data, styling select
 * elements, and the shared updateSelectColor utility.
 */

/**
 * Updates a select element's text color based on whether a value
 * is selected. Exported so other modules can use it directly.
 */
export function updateSelectColor(selectElement) {
  if (selectElement.value === '') {
    selectElement.classList.add('text-textSecondary');
    selectElement.classList.remove('text-textPrimary');
  } else {
    selectElement.classList.add('text-textPrimary');
    selectElement.classList.remove('text-textSecondary');
  }
}

/**
 * Populates ALL dropdowns of a given name, or a single specific one.
 * Used for simple flat lists (e.g. disciplines, backgrounds).
 */
export function populateFlatDropdown(selectName, jsonPath, targetSelect = null) {
  const selects = targetSelect ? [targetSelect] : document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  return fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
      const optionsHTML = data.map(item => `<option value="${item.value}">${item.label}</option>`).join('');
      selects.forEach(select => {
        Array.from(select.options).forEach(option => {
          if (!option.disabled) option.remove();
        });
        select.insertAdjacentHTML('beforeend', optionsHTML);
        if (!targetSelect) select.value = "";
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
}

/**
 * Populates ALL grouped dropdowns of a given name, or a single specific one.
 * Used for optgroup lists (e.g. clans, merits, flaws).
 */
export function populateGroupedDropdown(selectName, jsonPath, optionFormatter, targetSelect = null) {
  const selects = targetSelect ? [targetSelect] : document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  return fetch(jsonPath)
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
        select.querySelectorAll('optgroup').forEach(group => group.remove());
        select.insertAdjacentHTML('beforeend', groupsHTML);
        if (!targetSelect) select.value = "";
      });
    })
    .catch(error => console.error(`Error populating [${selectName}]:`, error));
}

/**
 * Initializes select element color styling for ALL selects on the page,
 * or a single specific one. Keeps placeholder text visually dimmed.
 */
export function initializeSelectElementStyling(targetElement = null) {
  const allSelects = targetElement ? [targetElement] : document.querySelectorAll('select');

  allSelects.forEach(select => {
    updateSelectColor(select);
    select.addEventListener('change', (event) => updateSelectColor(event.currentTarget));
  });
}