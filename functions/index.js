const functions = require('firebase-functions');
const Telegraf = require('telegraf');
const {default: firestoreSession} = require('telegraf-session-firestore');
const Session = require('telegraf/session');
const {Stage} = Telegraf;

//const GoogleSheet = require('./modules/google-sheet');

const {MainMenu} = require('./modules/main-menu');

let config = require('./env.json');
if (Object.keys(functions.config()).length) {
    config = functions.config();
}


// let googleSheet = new GoogleSheet();
// googleSheet.init();


let admin = require("firebase-admin");
let serviceAccount = require(config.fireb["service-account"]);

try {
    admin.firestore();
} catch (error) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://eh-bot-46aff.firebaseio.com"
    });
}

const db = admin.firestore();
const bot = new Telegraf(config.telegram.bot_token);
const mainMenu = new MainMenu();

bot.use(async (ctx, next) => {
    let id = ctx.from.id;
    let firstName = ctx.from.first_name;
    let lastName = ctx.from.last_name;
    let username = ctx.from.username;

    //todo: move students inside location
    let studentRef = db.collection('students');
    db.collection('students').where('id', '==', id).get().then((students) => {
        if (students.docs.length) {
            students.forEach((student) => {
                student.ref.update({firstName: firstName, lastName: lastName, username: username});
            });

            return next();
        }
        studentRef.add({id: id, firstName: firstName, lastName: lastName, username: username});

        return next();
    });
});

bot.use((ctx, next) => {

    ctx.customizedReply = (text, extra = undefined) => {
        return ctx.reply(
            text,
            extra
        ).then((msg) => {
            if (ctx.scene.state && ctx.scene.state.messages) {
                ctx.scene.state.messages.push(msg.message_id);
            }
        });
    };
    return next();
});
bot.use(Session());
//bot.use(firestoreSession(db.collection('sessions')));
bot.use((ctx, next) => {
    db.collection('system').doc('version').get().then((version) => {
        let importVersion = version.data().version;

        if (ctx.session.importVersion === undefined) {
            ctx.session.importVersion = importVersion;
            ctx.session.quote = {};
        }

        if (importVersion !== ctx.session.importVersion) {
            ctx.session.importVersion = importVersion;
            ctx.session.quote = {};

            ctx.reply("Дані оновилися! Тож треба почати спочатку! Таке трапляється :) ")
        }

        return next();
    });
});

const IndividualClass = require('./modules/scene/individual');
let individualClass = new IndividualClass(db);

const stage = new Stage([individualClass.getScene()]);
bot.use(stage.middleware());



bot.start((ctx) => {
    return mainMenu.render(ctx);
});

bot.hears('Меню', async (ctx) => {
        mainMenu.renderInline(ctx);
    }
);

individualClass.getScene().leave(
    (ctx) => {
        mainMenu.render(ctx, 'Тицяй МЕНЮ коли захочеш записатися ще!❤️');
    },
    individualClass.getScene().leaveMiddleware()
);


bot.action('individual-booking', Stage.enter(individualClass.getSceneKey()));

bot.launch();

exports.bot = functions.https.onRequest((req, res) => {
    bot.handleUpdate(req.body, res);
});

