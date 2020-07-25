const admin = require("firebase-admin");
const config = require('../config').init();

module.exports = {
    init() {

        let serviceAccount = require(config.fireb["service-account"]);

        try {
            admin.firestore();
        } catch (error) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://eh-bot-46aff.firebaseio.com"
            });
        }

        return admin.firestore();
    }
};
