const KEY_SCENE_INDIVIDUAL = 'KEY_SCENE_INDIVIDUAL';
const BaseScene = require('telegraf/scenes/base');
const {GraphEdge} = require('../../data-structures');
const LocationStep = require('./location');
const TeacherOrDate = require('./teacher-or-date');
const Teacher = require('./teacher');
//const Date = require('./date');
const Timeslot = require('./timeslot');
const Booking = require('./booking');
const Success = require('./success');
const StepEngine = require('./step-engine');

module.exports = IndividualClass;

class IndividualClass {
    constructor(firestore) {
        this.locationStep = new LocationStep({firestore});
        this.teacherOrDateStep = new TeacherOrDate({});
        this.teacherStep = new Teacher({firestore});
        //this.dateStep = new Date({firestore});
        this.timeslotStep = new Timeslot({firestore});
        this.bookingStep = new Booking({firestore});
        this.successStep = new Success({firestore});
        this.stepEngine = new StepEngine(true);
        this.scene = this._initScene();

        this._populateGraph();
    }

    getScene() {
        return this.scene;
    }

    getSceneKey() {
        return KEY_SCENE_INDIVIDUAL;
    }

    _initScene() {
        let scene = new BaseScene(KEY_SCENE_INDIVIDUAL);
        scene.enter(this._onSceneEnter(ctx));
        scene.leave(this._onSceneLeave(ctx));

        scene.action(/location:(.+)/, async (ctx) => {
            this.stepEngine.run(ctx, this.locationStep.getKey());
        });

        scene.action(/choose-by:(.+)/, async (ctx) => {
            this.stepEngine.run(ctx, this.teacherOrDateStep.getKey());
        });
        //
        // scene.action(/teacher-pag:(.+)/, async (ctx) => {
        //     this.timeslotStep.renderByTeacher(ctx, parseInt(ctx.match[1]), true);
        // });

        scene.action(/teacher:(.+)/, async (ctx) => {
            this.stepEngine.run(ctx, this.teacherStep.getKey());

        });

        scene.action(/timeslot:(.+)/, async (ctx) => {
            this.stepEngine.run(ctx, this.timeslotStep.getKey());
        });

        scene.action("booking:yes", async (ctx) => {
            this.stepEngine.run(ctx, this.bookingStep.getKey());
        });

        return scene;
    }

    _onSceneEnter(ctx) {
        ctx.scene.state.messages = [];

        ctx.answerCbQuery("", false);
        ctx.scene.state.stepHistory = [];
        this.stepEngine.run(ctx, null);
    }

    _onSceneLeave(ctx) {
        ctx.scene.state.messages.forEach((messageId) => {
            console.log(messageId);
            ctx.deleteMessage(messageId).catch((error) => {
                console.log(error);
            });
        });
    }

    _populateGraph() {
        this.stepEngine.addEdge(new GraphEdge(this.locationStep, this.teacherOrDateStep));
        this.stepEngine.addEdge(new GraphEdge(this.teacherOrDateStep, this.teacherStep));
        this.stepEngine.addEdge(new GraphEdge(this.teacherStep, this.timeslotStep));
        this.stepEngine.addEdge(new GraphEdge(this.timeslotStep, this.bookingStep));
        this.stepEngine.addEdge(new GraphEdge(this.bookingStep, this.successStep));
    }
}



// ctx.deleteMessage();
// ctx.reply(
//     `Давай почнемо!`,
//     //Markup.keyboard([Markup.callbackButton("НАЗАД")]).resize().extra()
// ).then((msg) => {
//     //Solve this globally.
//     ctx.scene.state.messages.push(msg.message_id);
//
//     // ctx.scene.state.stepHistory = [];
//     // //this.locationStep.render(ctx);
//     // this.stepEngine.run(ctx, null);
// });
