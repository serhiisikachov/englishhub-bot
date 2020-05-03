const BaseScene = require('telegraf/scenes/base');
const Markup = require('telegraf/markup');
const KEY_SCENE_INDIVIDUAL = 'KEY_SCENE_INDIVIDUAL';

const LocationStep = require('./location');
const TeacherOrDate = require('./teacher-or-date');
const Teacher = require('./teacher');
const Date = require('./date');
const Timeslot = require('./timeslot');
const Booking = require('./booking');

class IndividualClass {
    getScene() {
        return this.scene;
    }

    constructor(firestore) {
        this.locationStep = new LocationStep(firestore);
        this.teacherOrDateStep = new TeacherOrDate();
        this.teacherStep = new Teacher(firestore);
        this.dateStep = new Date(firestore);
        this.timeslotStep = new Timeslot(firestore);
        this.bookingStep = new Booking(firestore);
        this.scene = this.initScene();
    }

    getSceneKey() {
        return KEY_SCENE_INDIVIDUAL;
    }

    initScene() {
        let scene = new BaseScene(KEY_SCENE_INDIVIDUAL);
        scene.enter((ctx) => {
            console.log(ctx.scene.state);
            ctx.scene.state.messages = [];

            ctx.answerCbQuery("", false);
           // ctx.deleteMessage();
            ctx.reply(
                `Давай почнемо!`,
                Markup.keyboard([Markup.callbackButton("НАЗАД")]).resize().extra()
            ).then((msg) => {
                console.log(msg.message_id, msg.text);
                //Solve this globally.
                ctx.scene.state.messages.push(msg.message_id);
                this.locationStep.render(ctx);
            });
        });

        // scene.leave(
        //     (ctx) => {
        //         console.log(ctx.scene.state);
        //
        //         ctx.scene.state.messages.forEach((messageId) => {
        //             console.log(messageId);
        //             ctx.deleteMessage(messageId).catch((error) => {
        //                 console.log(error);
        //             });
        //         });
        //     }
        // );

        scene.action(/location:(.+)/, async (ctx) => {
            this.locationStep.handle(ctx);
            this.teacherOrDateStep.render(ctx);
        });

        scene.action('/choose-by-teacher', async (ctx) => {
            this.teacherOrDateStep.handle(ctx);
            this.teacherStep.render(ctx);

        });

        scene.action('/choose-by-date', async (ctx) => {
            this.teacherOrDateStep.handle(ctx);
            this.dateStep.render(ctx);

        });

        scene.action(/teacher-pag:(.+)/, async (ctx) => {
            this.timeslotStep.renderByTeacher(ctx, parseInt(ctx.match[1]), true);
        });

        scene.action(/teacher:(.+)/, async (ctx) => {
            this.teacherStep.handle(ctx, (ctx) => this.timeslotStep.renderByTeacher(ctx));

        });

        scene.action(/timeslot:(.+)/, async (ctx) => {
            this.timeslotStep.handle(ctx, (ctx) => this.bookingStep.renderConfirmation(ctx));
        });

        scene.action("booking:yes", async (ctx) => {this.bookingStep.create(ctx)});

        scene.hears('НАЗАД', async (ctx) => {
                ctx.scene.leave();
            }
        );

        return scene;
    }
}


module.exports = IndividualClass;
