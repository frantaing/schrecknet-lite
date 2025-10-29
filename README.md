# SchreckNet Lite

Unofficial Vampire: The Masquerade V20/V5 interactive character sheet.  
Fan-made project built with **Vite**, **Tailwind CSS**, and **vanilla JavaScript**.

> [!NOTE]
> V20 Sheet is...fully complete! Fully functional sheet, complete with the freebie mode!

> I am currently working on styling the V5 sheet, though I don't know when I'll finish it. I'll still work on the V20 sheet, if I am struck by sudden inspiration and determination.

> Have a pancake! 🥞

👉 [**Try it here!**](https://overuseofrem.github.io/schrecknet-lite/)

<br>

## 📌 About the project

The goal is to recreate a simple, interactive character sheet for **Vampire: The Masquerade**, starting with **V20** and later adding **V5** support.  
It is heavily inspired by the [SchreckNet](https://www.schrecknet.live/) character sheet site and by existing fan projects, especially [VTMsite](https://github.com/DrSharky/VTMsite) by DrSharky. ❤️

This is a **pure front-end application** that runs entirely in your browser. No data is saved, and no login is required.

> ❗ This is a personal fan project! All game rules, terminology, and setting elements are owned by their respective copyright holders (White Wolf Publishing / Paradox Interactive). This project is for educational, recreational, and non-commercial purposes only.

<br>


## ✨ Features (V20 Sheet)

The V20 sheet now fully implements the character creation process from the core rulebook:

-   **Interactive Dot System:** Click to assign points to Attributes, Abilities, Disciplines, Backgrounds, and Virtues.
-   **Rule-Aware Point Allocation:**
    -   Separate, managed point pools for each character creation stage.
    -   Point counters that update in real-time.
    -   Prevents spending more points than are available.
-   **Dynamic & Intelligent Dropdowns:**
    -   Clan selection automatically populates in-clan Disciplines.
    -   Dynamically add or remove rows for Disciplines, Backgrounds, Merits, and Flaws.
    -   Prevents duplicate selections for a valid character sheet.
-   **Complete Freebie Point System:**
    -   Enter a final, dedicated "Freebie Mode" to spend your initial 15 points.
    -   Strict enforcement of Freebie Point costs for all traits.
    -   Gain up to 7 additional points by selecting Flaws, with Merit options dynamically updating based on available points.
-   **Derived Stat Calculation:** Humanity/Path and Willpower are automatically calculated and updated based on Virtue scores.

<br>

## 🚀 Running Locally

**Prerequisites:**
-   [Node.js](https://nodejs.org/) (v20.x or higher)
-   npm (included with Node.js)

**Instructions:**

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/overuseofrem/schrecknet-lite.git
    cd schrecknet-lite
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Run the dev server:**
    ```sh
    npm run dev
    ```
    This will start a local server, usually at `http://localhost:5173`.

<br>

## ⏳ Project Status & Future Plans

-   ✅ **V20 Sheet:** The character creation workflow is **complete and stable**. Future V20 work will focus on minor enhancements like tooltips and UI polish.
-   🚧 **V5 Sheet:** Currently in the **early styling phase**. The core structure is in place, but interactivity has not yet been implemented.
-   **Overall:** The project is moving towards an official `1.0.0` release, marking the completion of the V20 sheet.

<br>

## 📷 Inspirations and Sources

- [SchreckNet](https://www.schrecknet.live/)
- [VTMsite](https://github.com/DrSharky/VTMsite) by DrSharky
- Official V20 and V5 rulebooks (for structure and reference)
- VtM wikis like the [White Wolf wiki](https://whitewolf.fandom.com/wiki/Main_Page) and the [Paradox wiki](https://vtm.paradoxwikis.com/VTM_Wiki)  
- Vite & Tailwind CSS documentation

<br>

## 📝 Disclaimer

This is a fan-made, non-commercial project created for educational and recreational purposes only.  
All game mechanics, setting terms, and thematic elements belong to their respective copyright holders.  
This project is not affiliated with, endorsed, sponsored, or specifically approved by White Wolf Publishing, Paradox Interactive, or any related entity.  
All original code in this repository is licensed under the [MIT License](LICENSE).
