const Markup = require('telegraf/markup');

class TeacherOrDate {
    render(ctx) {
        ctx.deleteMessage();
        ctx.reply(
            "Обиратимеш по вчителю чи по даті?",
            Markup.inlineKeyboard(
                [
                    Markup.callbackButton('Вчитель', 'choose-by:teacher'),
                    Markup.callbackButton('Дата', 'choose-by:date')
                ]
            ).extra()
        )
    }

    handle(ctx) {
        ctx.answerCbQuery(ctx.match[1]);
        ctx.session.quote.teacherOrDate = ctx.match[1];
    }

    isFullfilled(ctx) {
        return ctx.session.quote.teacherOrDate;
    }

    cleanUp(ctx) {
        ctx.session.quote.teacherOrDate = null;
    }

    requireInput() {
        return true;
    }

    getKey() {
        return 'teacherOrDate';
    }
}

module.exports = TeacherOrDate;
