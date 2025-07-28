// config.js

export const config = {
    /* game options */
    gameCelebratingDuration: 2000, // Duration of a goal celebrating (ms)
    countdownDuration: 3000, // Duration of a countdown before a round starts (ms)
    finalScore: 5,

    /* game field options */
    fieldHeight: 480, // (px)
    fieldWidth: 640, // (px)
    playerZoneBorderColor: 'white',

    /* goal area options */
    goalAreaHeight: 100, // (px)
    goalAreaWidth: 10, // (px)

    /* ball options */
    ballSize: 20, // Default ball size (px) ! not radius !
    ballSpeed: 5, // Default ball speed (px)

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

    /* color options */
    ballColor: 'white',
    fieldColor: 'green',

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
