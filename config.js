// config.js

export const config = {
    /* game options */
    gameCelebratingDuration: 2000, // Duration of a goal celebrating (ms)
    countdownDuration: 3000, // Duration of a countdown before a round starts (ms)
    finalScore: 5,

    /* game field options */
    fieldHeight: 480, // (px)
    fieldWidth: 640, // (px)

    /* goal area options */
    goalAreaHeight: 100, // (px)
    goalAreaWidth: 10, // (px)

    /* ball options */
    ballSize: 10, // Default ball size (px)
    ballSpeed: 8, // Default ball speed (px)

    /* player options */
    playerSize: 50, // Default player size (px)
    playerSpeed: 10, // Default player speed (px)
    playerDifficultyLevels: ['easy', 'normal', 'hard'],

    /* color options */
    ballColor: 'white',
    playerColors: [
        'aliceblue',
        'antiquewhite',
        'aquamarine',
        'blanchedalmond',
        'burlywood',
        'cadetblue',
    ],
    fieldColor: 'green',

    /* sound options */
    soundOn: false, // Toggle sound on/off
    soundMap: {
        goal: '',
        collision: '',
    },

    /* debug options */
    loggingEnabled: true, // Toggle logging on/off
    endlessGame: true,
    allBots: true,
};
