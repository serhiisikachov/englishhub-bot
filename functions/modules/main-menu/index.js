const Markup = require('telegraf/markup');

class MainMenu {
    render(ctx, message='Радий тебе бачити!Можеш записатися на індивідуалку у меню або подивитися в особистом кабінеті куди ти вже записаний!Що обираєш?') {
        let menu = {
            "book": "Меню",
            'myspace': "Особистий кабінет"
        };
        let buttons = [];

        for (const key in menu) {
            console.log(key);

            buttons.push(
                Markup.callbackButton(menu[key], key)
            )
        }

        return ctx.reply(
            message,
            Markup.keyboard([buttons]).resize().extra()
        );
    }

    renderInline(ctx) {
        let buttons = [Markup.callbackButton("Запис на індивідуальне заняття🤴‍", 'individual-booking')];

        return ctx.reply(
            "Круто💪 Тепер обирай тут👇",
            Markup.inlineKeyboard(buttons).oneTime(true).removeKeyboard(true).extra()
        );
    }

    handle(ctx) {
        ctx.answerCbQuery(`Ти обрав ${ctx.match[1]}`);
    }
}

module.exports = { MainMenu };
