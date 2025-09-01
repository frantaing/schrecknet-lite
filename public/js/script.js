// DROPDOWN: Generic Flat dropdowns
// # Links 'nature_demeanor.json', 'disciplines.json' and 'backgrounds.json' to their dropdowns
// # Also makes sure placeholder options are not overriden
function populateFlatDropdown(selectName, jsonPath) {
  const selects = document.querySelectorAll(`select[name="${selectName}"]`);
  if (!selects.length) return;

  fetch(jsonPath)
    .then(res => res.ok ? res.json() : Promise.reject(`HTTP error ${res.status}`))
    .then(data => {
      selects.forEach(select => {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.value;
          option.textContent = item.label;

          // Optional metadata
          if (item.cost) option.dataset.cost = item.cost;
          if (item.dots) option.dataset.dots = item.dots;

          select.appendChild(option);
        });
        select.value = ""; // keep placeholder
      });
    })
    .catch(err => {
      console.error(err);
      selects.forEach(select => {
        select.innerHTML = '<option value="">Error loading options</option>';
      });
    });
}
document.addEventListener('DOMContentLoaded', function() {
  populateFlatDropdown('discipline', 'data/V20/disciplines.json');
  populateFlatDropdown('background', 'data/V20/backgrounds.json');
  populateFlatDropdown('nature', 'data/V20/nature_demeanor.json');
  populateFlatDropdown('demeanor', 'data/V20/nature_demeanor.json');
});

// DROPDOWN: Clan/Bloodlines json
// # Links 'clan_bloodline.json' to the Clan dropdown
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function () {
  const clanSelect = document.querySelector('select[name="clan"]');

  if (!clanSelect) {
    return;
  }

  const jsonPath = 'data/V20/clan_bloodline.json';

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
});

// DROPDOWN: Paths json
// # Links 'paths.json' to the Clan dropdown
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function () {
  const clanSelect = document.querySelector('select[name="paths"]');

  if (!clanSelect) {
    return;
  }

  const jsonPath = 'data/V20/paths.json';

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
});

// DROPDOWN: Merits json
// # Links 'merits.json' to the Merit dropdown
// # Shows cost and stores it in a data attribute
document.addEventListener('DOMContentLoaded', function () {
  const meritsSelect = document.querySelector('select[name="merit"]');
  if (!meritsSelect) return;

  const jsonPath = 'data/V20/merits.json';

  fetch(jsonPath)
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
          option.value = item.value; // for form submission
          option.textContent = `${item.label} (${item.cost})`; // display includes cost
          option.setAttribute('data-cost', item.cost); // for calculations later
          optgroup.appendChild(option);
        });

        meritsSelect.appendChild(optgroup);
      });

      meritsSelect.value = ""; // reset to placeholder
    })
    .catch(error => {
      console.error('Error fetching merits data:', error);
      meritsSelect.innerHTML = '<option value="">Error loading merits</option>';
    });
});

// DROPDOWN: Flaws json
// # Links 'flaws.json' to the Flaw dropdown
// # Shows cost and stores it in a data attribute
document.addEventListener('DOMContentLoaded', function () {
  const meritsSelect = document.querySelector('select[name="flaw"]');
  if (!meritsSelect) return;

  const jsonPath = 'data/V20/flaws.json';

  fetch(jsonPath)
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
          option.value = item.value; // for form submission
          option.textContent = `${item.label} (${item.cost})`; // display includes cost
          option.setAttribute('data-cost', item.cost); // for calculations later
          optgroup.appendChild(option);
        });

        meritsSelect.appendChild(optgroup);
      });

      meritsSelect.value = ""; // reset to placeholder
    })
    .catch(error => {
      console.error('Error fetching flaws data:', error);
      meritsSelect.innerHTML = '<option value="">Error loading flaws</option>';
    });
});

// DROPDOWN: Text color
// # Dynamically styles the <select> 'placeholder'
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
document.addEventListener('DOMContentLoaded', initializeSelectElementStyling);