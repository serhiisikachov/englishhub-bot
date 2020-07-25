const Markup = require('telegraf/markup');
const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');

class TeacherOrDate extends GraphVertex {
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
        ).then((msg) => ctx.scene.state.messages.push(msg.message_id));
    }

    handle(ctx) {
        ctx.answerCbQuery(ctx.match[1]);
        ctx.session.quote[this.getKey()] = {
            "selected": ctx.match[1]
            };
    }

    isFullfilled(ctx) {
        return ctx.session.quote[this.getKey()];
    }

    cleanUp(ctx) {
        ctx.session.quote[this.getKey()] = null;
    }

    getKey() {
        return 'teacherOrDate';
    }
}

module.exports = TeacherOrDate;
