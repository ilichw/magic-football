// config.js

export const config = {
    /* game options */
    gameCelebratingDuration: 2000, // Duration of a goal celebrating (ms)
    countdownDuration: 3000, // Duration of a countdown before a round starts (ms)
    finalScore: 5,

    gameField: {
        width: 640,
        height: 480,
        color: 'green',
    },

    playerZoneBorderColor: 'white',

    goalArea: {
        width: 10,
        height: 100,
    },

    ball: {
        size: 20, // radius 10
        speed: 5,
        color: 'white',
    },

    player: {
        size: 50, // Default player size (px)
        speed: 10, // Default player speed (px)
        startPos: 50, // distance from field border on the game start
        difficultyLevels: ['easy', 'normal', 'hard'],
        colors: [
            'aliceblue',
            'antiquewhite',
            'aquamarine',
            'blanchedalmond',
            'burlywood',
            'cadetblue',
        ],
    },

    /* sound options */
    soundOn: false, // Toggle sound on/off
    soundMap: {
        goal: '',
        collision: '',
    },

    debug: {
        loggingEnabled: true, // Toggle logging on/off
        endlessGame: true,
        allBots: true,
        enableHorizontalMovement: false,
    },
};
