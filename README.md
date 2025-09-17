# SchreckNet Lite

Unofficial Vampire: The Masquerade V20/V5 interactive character sheet.  
Fan-made project built with **Vite**, **Tailwind CSS**, and **vanilla JavaScript**.

> [!NOTE]
> V20 Sheet is...fully complete! Fully functional sheet, complete with the freebie mode! I do plan on expanding the Nature/Demeanor list, since I was trawling through the wiki, and adding tooltips. I am currently working on styling the V5 sheet, though I don't know when I'll finish it.
> Have a pancake! 🥞

👉 [**Try it here!**](https://overuseofrem.github.io/schrecknet-lite/)

<br>

## 📌 About the project

The goal is to recreate a simple, interactive character sheet for **Vampire: The Masquerade**, starting with **V20** and later adding **V5** support.  
It is inspired by the [SchreckNet](https://www.schrecknet.live/) character sheet site and by existing fan projects, especially [VTMsite](https://github.com/DrSharky/VTMsite) by DrSharky. ❤️

For now, the scope is **just** the sheet UI — dots, dropdowns, form inputs, and basic V20 freebie point calculations.  
No saving, exporting, or login features yet.  

This is a **pure front-end project** built with a modern toolchain for a fast development experience. Future plans include moving to React, adding backend functionality, and expanding the toolset.

> ❗ This is a personal fan project! All game rules, terminology, and setting elements are owned by their respective copyright holders (White Wolf Publishing / Paradox Interactive). This project is for educational, recreational, and non-commercial purposes only.

<br>

## 🔧 Tech Stack

-   **Vite:** Serves as the build tool and development server.
-   **HTML5:** For the core structure of the character sheets.
-   **Tailwind CSS:** For all styling and the utility-first CSS framework.
-   **Vanilla JavaScript:** For all client-side interactivity.

<br>

## 🚀 Running Locally

This project uses Vite for a fast and modern development experience.

**Prerequisites:**
-   [Node.js](https://nodejs.org/) (version 20.x or higher is recommended)
-   npm (which comes included with Node.js)

**Steps:**

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/overuseofrem/schrecknet-lite.git
    cd schrecknet-lite
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    This will start a local server (usually at `http://localhost:5173`). The site will automatically reload as you make changes to the source files.

4.  **Build for production:**
    ```sh
    npm run build
    ```
    This command bundles the entire project into a `/dist` directory. This is the exact process used by the GitHub Actions workflow to deploy the site.

<br>

## 🍮 Features (current and planned)

- Minimalist, responsive design
- Three-page structure:
  - Home/welcome page
  - V20 character sheet
  - V5 character sheet (placeholder for now)

### ✨ Features in V20 Sheet
- Interactive dots for Attributes, Abilities, Advantages
- Dropdowns for Clans, Disciplines, Natures, Backgrounds
- Priority allocation for Attributes & Abilities
- Freebie Points mode with live calculation + enforcement
- Responsive layout (mobile + desktop)

<br>

## 📷 Inspirations and Sources

-   [SchreckNet](https://www.schrecknet.live/)
-   [VTMsite](https://github.com/DrSharky/VTMsite) by DrSharky
-   Official V20 and V5 rulebooks (for structure and reference)
-   Vite & Tailwind CSS documentation

<br>

## ⏳ Status

Currently in **early development**: building out the UI and laying the groundwork for interactivity.

### 📝 **To-Do List**

##### **Home Page**

-   [x] Set up the base HTML structure for the home page.
-   [x] Configure Tailwind with custom fonts, colors, and spacing.
-   [x] Style the home page layout using Tailwind CSS.
-   [x] Add navigation links to the V20 and V5 sheets.

#### **V20 Character Sheet**

##### **Structure & Layout**

-   [x] Build the header with the page name and website title.
-   [x] Build the main HTML structure for the V20 sheet.
-   [x] Implement mobile and desktop responsiveness for the entire V20 sheet layout.

##### **Basic Sections**

-   [x] Create the **basics** section with fields for character name, concept, chronicle, etc.
-   [x] Build the **attributes** section (Physical, Social, Mental) with interactive dots.
-   [x] Lay out the **abilities** section (Talents, Skills, Knowledges) with interactive dots.
-   [x] Design the **advantages** section, including:
    -   [x] Disciplines
    -   [x] Backgrounds
    -   [x] Virtues
-   [x] Create sections for **merits & flaws**.
-   [x] Set up the **humanity/path** and **willpower** tracks.

##### **Styling (Tailwind)**

-   [x] Style the overall V20 sheet layout.
-   [x] Style the interactive dots to reflect different states (e.g., filled, empty).
-   [x] Apply styling to all form inputs and dropdowns.

##### **Interactivity (JavaScript)**

-   [x] Implement click handling for the attribute dots.
-   [x] Implement click handling for the ability dots.
-   [x] Enable dropdown selections for disciplines and backgrounds.
-   [x] Create basic V20 freebie point calculation logic.
    -   [x] Attributes
    -   [x] Abilities
    -   [x] Merits/Flaws

#### **V5 Character Sheet**

-   [x] Create a placeholder page for the V5 sheet.
-   [ ] Build the main HTML structure for the V5 sheet.
-   [ ] Style the V5 sheet layout.

#### **General & Deployment**

-   [x] Set up Vite as the build tool for the project.
-   [x] Configure a GitHub Actions workflow for automated deployment.
-   [x] Deploy the site to GitHub Pages.
-   [x] Update the README with the live site link and setup instructions.
-   [ ] Perform a final code cleanup and add comments for clarity.

<br>

## 📝 Disclaimer

This is a fan-made, non-commercial project created for educational and recreational purposes only.  
All game mechanics, setting terms, and thematic elements belong to their respective copyright holders.  
This project is not affiliated with, endorsed, sponsored, or specifically approved by White Wolf Publishing, Paradox Interactive, or any related entity.  
All original code in this repository is licensed under the [MIT License](LICENSE).
