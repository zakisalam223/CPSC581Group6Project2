# "WeeModel"
An application to show expertise sharing of 3D modeling between a game master and apprentice in a creative way - using embodied input/output!

# Design Process
In addition to the initial sketches and brainstorming detailed in our document, we used Figma to finalize our designs before implementation.

Figma link:  https://www.figma.com/design/nOO2y2usijLp907GDpolum/CPSC-581-Projects?node-id=268-54&t=LBfI0s8HIyUuzone-1

# Demo Instructions
1. Visit the [deployed website](https://zakisalam223.github.io/CPSC581Group6Project2/)
2. Ready Up Screen: Click "Not ready" for both the apprentice and game master
4. Level Selection Screen: Click game card "1" to start this level
    - Note: The other game cards/levels below are for show (do not navigate to any other levels)
5. Apprentice Main Puzzle Screen: Click "INFO", "MORE" (within info box), and "PHONE" buttons for controls and task details
    - Note: "MORE" button details the emobodied input that the keybinds are generally mapped to
    - Note: "HELP" button is just for show (not implemented, and would've been extra implementation). The "HELP" button would provide the novice with a hint provided by the expert. 
6. Apprentice Main Puzzle Screen: After completing each task under the main goal, click the check-box
    - Note: Visit the [remote screen](https://zakisalam223.github.io/CPSC581Group6Project2/remote/remote.html) on your phone to demonstrate some embodied output (vibration functionality is only supported on android devices and certain browsers e.g. Google Chrome or Samsung Browser - your device must have vibrations on in your settings also)
7. Level Complete Screen: Once all check-boxes are checked click "Demo" button
8. Game Master Demo Puzzle Screen: Similar to the apprentice puzzle screen, but can record to save for the apprentice later (not implemented, but pop-ups show to signify the functionality)!

## How to develop:
If you don't have Node.js installed on your computer, install the LTS version from here: https://nodejs.org/

You can check if it's installed by running:\
`node --version`\
`npm --version`

After cloning the repository, run:

`npm install`
This installs all of the project's dependencies. You only need to run this once when setting up the project for the first time.

To start the development server, run:\
`npx vite`\
You should get a localhost URL in your terminal which you can open to see your changes.

## How to deploy to github pages:
In the main branch, run:\
`npm run build`\
`npx gh-pages -d dist`

You can preview it with: `npm run preview`

Then the github pages website (https://zakisalam223.github.io/CPSC581Group6Project2/) should be updated.
