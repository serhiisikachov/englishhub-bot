const functions = require('firebase-functions');
const admin = require("firebase-admin");

let config = require('../../env.json');
if (Object.keys(functions.config()).length) {
    config = functions.config();
}

let serviceAccount = require(config.firebase["service-account"]);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://eh-bot-46aff.firebaseio.com"
});

let db = admin.firestore();

let locationsRef = db.collection('locations');
let teachersRef = db.collection('teachers');

class FirebaseImport {
    constructor () {
        this.locationsRef = db.collection('locations');
        this.teachersRef = db.collection('teachers');
        this.studentsRef = db.collection('students');
        this.timeslotsRef = db.collection('timeslots');
        this.bookingsRef = db.collection('bookings');
    }

    importLocations() {
        locationsRef.add(JSON.parse('{"name": "kharkiv"}'))
    }
}

const importLocation = () => {
    // locationsRef.listDocuments().then((data) => {
    //      data.forEach((item) => item.delete());
    //
    // });

    let locations = JSON.parse(
        `
            [
                {"name": "kharkiv"},
                {"name": "lviv"}
            ]
        `
    );
    locations.forEach((item) => locationsRef.add(item).catch((error) => {console.log(error)}));
};

const importTeachers = () => {
    let teachers = JSON.parse(
        `
            [
                {"firstname": "Kseniya", "lastname": "Shokalo"},
                {"firstname": "Polina", "lastname": "Batkivna"},
                {"firstname": "Puya", "lastname": "Lakshari"},
                {"firstname": "Nastia", "lastname": "Something"}
            ]
        `
    );

    teachers.forEach((item) => teachersRef.add(item).catch((error) => {console.log(error)}));
};

module.exports = {
    importLocation,
    importTeachers
};
