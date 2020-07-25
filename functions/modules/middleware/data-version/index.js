const db = require('../../db').init();

module.exports = () => {
    return (ctx, next) => {
        db.collection('system').doc('version').get().then((version) => {
            let importVersion = version.data().version;

            if (ctx.session.importVersion === undefined) {
                ctx.session.importVersion = importVersion;
                ctx.session.quote = {};
            }

            if (importVersion !== ctx.session.importVersion) {
                ctx.session.importVersion = importVersion;
                ctx.session.quote = {};

                //ctx.reply("Дані оновилися! Тож треба почати спочатку! Таке трапляється :) ")
            }

            return next();
        });
    };
};
