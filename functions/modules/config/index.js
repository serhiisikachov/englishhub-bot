const functions = require('firebase-functions');

module.exports = {
    init() {
        let config = require('../../env.json');
        if (Object.keys(functions.config()).length) {
            config = functions.config();
        }

        return config;
    }
};
