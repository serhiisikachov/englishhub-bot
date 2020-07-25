/**
 * Imports
 */
const functions = require('firebase-functions');
const Telegraf = require('telegraf');
const session = require('telegraf/session');
const dataVersion = require('./modules/middleware/data-version');
const userSaver = require('./modules/middleware/user-saver');
const {Stage} = Telegraf;
const {MainMenu} = require('./modules/main-menu');
const IndividualClass = require('./modules/scene/individual');

/**
 * Initializations.
 */
const config = initConfig();
const db = require('./modules/db').init(config);
const bot = runBot();

/**
 * Exports main firebase function.
 */
exports.bot = functions.https.onRequest((req, res) => {
    bot.handleUpdate(req.body, res);
});

/**
 * Initializes configuration using env.json.
 */
function initConfig() {
    let config = require('./env.json');
    if (Object.keys(functions.config()).length) {
        config = functions.config();
    }

    return config;
}

/**
 * Inits and runs bot.
 */
function runBot()
{
    const bot = new Telegraf(config.telegram.bot_token);
    //todo: understand where to put main menu.
    const mainMenu = new MainMenu();
    const individualClass = new IndividualClass(db);
    const stage = new Stage([individualClass.getScene()]);

    bot.use(session());
    bot.use(dataVersion());
    bot.use(userSaver());
    bot.use(stage.middleware());

    bot.start((ctx) => {
        return mainMenu.render(ctx);
    });
    bot.hears('Меню', async (ctx) => {
            mainMenu.renderInline(ctx);
        }
    );
    bot.action('individual-booking', Stage.enter(individualClass.getSceneKey()));
    bot.launch();

    return bot;
}

//todo: make it work.

// individualClass.getScene().leave(
//     (ctx) => {
//         mainMenu.render(ctx, 'Тицяй МЕНЮ коли захочеш записатися ще!❤️');
//     },
//     individualClass.getScene().leaveMiddleware()
// );


