import '../css/app.css';

/**
 * Creates a full, correct URL to a static asset.
 * @param {string} assetPath - The relative path to the asset from the `public` folder.
 * @returns {string} The full, correct URL for fetching.
 */
function getAssetURL(assetPath) {
  // `import.meta.url` is the full URL of this JS file.
  // We use it as a base to correctly resolve the path to the data file.
  return new URL(`../${assetPath}`, import.meta.url).href;
}

// DROPDOWN: Generic Flat dropdowns
function populateFlatDropdown(selectName, jsonPath) {
  const selects = document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(getAssetURL(jsonPath)) // Use the new helper function
    .then(res => res.ok ? res.json() : Promise.reject(`HTTP error ${res.status}`))
    .then(data => {
      selects.forEach(select => {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value;
          option.textContent = item.label;
          if (item.cost) option.dataset.cost = item.cost;
          if (item.dots) option.dataset.dots = item.dots;
          select.appendChild(option);
        });
        select.value = "";
      });
    })
    .catch(err => {
      console.error(err);
      selects.forEach(select => {
        select.innerHTML = '<option value="">Error loading options</option>';
      });
    });
}

// DROPDOWN: Non-Generic dropdowns
document.addEventListener('DOMContentLoaded', function () {
  populateFlatDropdown('discipline', 'data/V20/disciplines.json');
  populateFlatDropdown('background', 'data/V20/backgrounds.json');
  populateFlatDropdown('nature', 'data/V20/nature_demeanor.json');
  populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json');

  // Load Clan/Bloodlines
  const clanSelect = document.querySelector('select[name="clan"]');
  if (clanSelect) {
    fetch(getAssetURL('data/V20/clan_bloodline.json'))
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        data.forEach(group => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = group.groupLabel;
          group.options.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            optgroup.appendChild(option);
          });
          clanSelect.appendChild(optgroup);
        });
        clanSelect.value = "";
      })
      .catch(error => {
        console.error('Error fetching clan data:', error);
        clanSelect.innerHTML = '<option value="">Error loading clans</option>';
      });
  }

  // Load Paths
  const pathsSelect = document.querySelector('select[name="paths"]');
  if (pathsSelect) {
    fetch(getAssetURL('data/V20/paths.json'))
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        data.forEach(group => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = group.groupLabel;
          group.options.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            optgroup.appendChild(option);
          });
          pathsSelect.appendChild(optgroup);
        });
        pathsSelect.value = "";
      })
      .catch(error => {
        console.error('Error fetching paths data:', error);
        pathsSelect.innerHTML = '<option value="">Error loading paths</option>';
      });
  }

  // Load Merits
  const meritsSelect = document.querySelector('select[name="merit"]');
  if (meritsSelect) {
    fetch(getAssetURL('data/V20/merits.json'))
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        data.forEach(group => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = group.groupLabel;
          group.options.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = `${item.label} (${item.cost})`;
            option.setAttribute('data-cost', item.cost);
            optgroup.appendChild(option);
          });
          meritsSelect.appendChild(optgroup);
        });
        meritsSelect.value = "";
      })
      .catch(error => {
        console.error('Error fetching merits data:', error);
        meritsSelect.innerHTML = '<option value="">Error loading merits</option>';
      });
  }

  // Load Flaws
  const flawsSelect = document.querySelector('select[name="flaw"]');
  if (flawsSelect) {
    fetch(getAssetURL('data/V20/flaws.json'))
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        data.forEach(group => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = group.groupLabel;
          group.options.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = `${item.label} (${item.cost})`;
            option.setAttribute('data-cost', item.cost);
            optgroup.appendChild(option);
          });
          flawsSelect.appendChild(optgroup);
        });
        flawsSelect.value = "";
      })
      .catch(error => {
        console.error('Error fetching flaws data:', error);
        flawsSelect.innerHTML = '<option value="">Error loading flaws</option>';
      });
  }

  // Initialize styling for all select elements
  initializeSelectElementStyling();
});

// DROPDOWN: Text color
function initializeSelectElementStyling() {
  const allSelects = document.querySelectorAll('select');
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
    select.addEventListener('change', (event) => {
      updateSelectColor(event.currentTarget);
    });
  });
}