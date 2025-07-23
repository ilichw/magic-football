// soundEngine.js

export class SoundEngine {
    constructor(soundMap, soundOn) {
        this.soundMap = soundMap;
        this.soundOn = soundOn;

        if (this.soundOn) {
            this.goalSound = new Audio('path/to/goal-sound.mp3');
            this.collisionSound = new Audio('path/to/collision-sound.mp3');
        }
    }

    play(soundName) {
        if (!this.soundOn) {
            console.log(`sound: ${soundName}`);
        } else {
            let sound;
            switch (soundName) {
                case 'goal':
                    sound = this.goalSound;
                    break;
                case 'collision':
                    sound = this.collisionSound;
                    break;
            }
            if (sound !== undefined) {
                sound.play();
            }
        }
    }
}
