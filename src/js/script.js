// DROPDOWN: Nature/Demeanor json
// # Links 'nature_demeanor.json' to the Nature/Demeanor dropdowns
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function() {

  const selectElements = document.querySelectorAll('select[name="nature"], select[name="demeanor"]');

  if (selectElements.length === 0) {
    return;
  }
  
  const jsonPath = 'data/V20/nature_demeanor.json';

  function populateDropdown(selectElement, data) {
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label.charAt(0).toUpperCase() + item.label.slice(1);
      selectElement.appendChild(option);
    });
  }

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      selectElements.forEach(dropdown => {
        populateDropdown(dropdown, data);
        
        dropdown.value = ""; 
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      selectElements.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Error loading data</option>';
      });
    });

});

// DROPDOWN: Clan/Bloodlines json
// # Links 'clan_bloodline.json' to the Clan dropdown
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function() {
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

// DROPDOWN: Disciplines json
// # Links 'disciplines.json' to the Discipline dropdowns
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function() {

  const selectElements = document.querySelectorAll('select[name="discipline"]');

  if (selectElements.length === 0) {
    return;
  }
  
  const jsonPath = 'data/V20/disciplines.json';

  function populateDropdown(selectElement, data) {
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      selectElement.appendChild(option);
    });
  }

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      selectElements.forEach(dropdown => {
        populateDropdown(dropdown, data);
        
        dropdown.value = ""; 
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      selectElements.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Error loading data</option>';
      });
    });

});

// DROPDOWN: Backgrounds json
// # Links 'backgrounds.json' to the Backgrounds dropdowns
// # Also makes sure placeholder options are not overridden
document.addEventListener('DOMContentLoaded', function() {

  const selectElements = document.querySelectorAll('select[name="background"]');

  if (selectElements.length === 0) {
    return;
  }
  
  const jsonPath = 'data/V20/backgrounds.json';

  function populateDropdown(selectElement, data) {
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.value;
      selectElement.appendChild(option);
    });
  }

  fetch(jsonPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      selectElements.forEach(dropdown => {
        populateDropdown(dropdown, data);
        
        dropdown.value = ""; 
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      selectElements.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Error loading data</option>';
      });
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