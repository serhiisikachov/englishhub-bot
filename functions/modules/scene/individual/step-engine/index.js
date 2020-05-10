const Graph = require('javascript-algorithms-and-data-structures/src/data-structures/graph/Graph');

class StepEngine extends Graph{


//Check or expired session => drop session and start over from the first step
//If button of further step is pressed => render current needed step
//If the button of correct session is pressed => clean all the next step

    async run(ctx, currentStepKey) {
        let currentStep = getCurrentStep(this.steps, currentStepKey);

        if (arePrevStepsFulfilled(ctx, this.steps, currentStepKey)) {
            cleanUpNextSteps(ctx, this.steps, currentStepKey);
            if (!currentStep.requireInput() || Array.isArray(ctx.match)) {
                console.log("!currentStep.requireInput() || ctx.match.length > 0");
                await currentStep.handle(ctx);
                getNextStep(ctx, this.steps, currentStep.getKey()).render(ctx);

                return;
            }

            console.log("currentStep.render(ctx);");
            currentStep.render(ctx);

            return;
        }

        ctx.match = null;
        this.run(ctx, getPrevStep(this.steps, currentStep.getKey()).getKey());
    }
}

function getCurrentStep(steps, currentStepKey) {
    for (let i = 0; i < steps.length; i++) {
        if (Array.isArray(steps[i])) {
            let current = getCurrentStep(steps[i]);
            if (current.getKey() === currentStepKey) {
                return current;
            }

            continue;
        }

        if (steps[i].getKey() === currentStepKey) {
            console.log(steps[i]);
            return steps[i];
        }
    }

    return steps[0];
}

function getPrevStep(steps, currentStepKey) {
    for (let i = 0; i < steps.length; i++) {
        if (Array.isArray(steps[i])) {
            for (let j = 0; j < steps[i].leading; j++) {
                if (steps[i][j].isFullfilled()) {
                    return steps[i][j];
                }
            }

            continue;
        }

        if (steps[i].getKey() === currentStepKey) {
            if (i < 1) {
                return steps[0];
            }

            return steps[i - 1];
        }
    }

    throw new Error("Prev step was not found.");
}

function getNextStep(ctx, steps, currentStepKey) {
    for (let i = 0; i < steps.length; i++) {

        console.log(i);

        if (steps[i].getKey() === currentStepKey) {
            if (i + 1 >= steps.length) {
                return steps[i];
            }

            if (Array.isArray(steps[i+1])) {
                for (let j = 0; j < steps[i+1].length; j++) {
                    console.log(`${steps[i+1][j].getKey()} === ${ctx.match[1]}`);
                    if (steps[i+1][j].getKey() === ctx.match[1]) {
                        return steps[i+1][j];
                    }
                }

                continue;
            }

            return steps[i + 1];
        }
    }

    throw new Error('Step not found.');
}

function arePrevStepsFulfilled(ctx, steps, currentStepKey) {
    if (currentStepKey === null) return true;

    for (let i = 0; i < steps.length; i++) {
        if (Array.isArray(steps[i])) {
            let fulfilledItems = steps[i].filter(item => {
               return item.isFullfilled(ctx);
            });

            if (fulfilledItems.length) {
                continue;
            }

            return false;
        }

        if (steps[i].getKey() === currentStepKey) {
            return true;
        }

        if (steps[i].isFullfilled(ctx)) {
            continue;
        }

        return false;
    }

    return false;
}

function cleanUpNextSteps(ctx, steps, currentStepKey)
{
    let cleanUpMarker = false;

    if (currentStepKey === null) {
        cleanUpMarker = true;
    }

    for (let i = 0; i < steps.length; i++) {
        if (Array.isArray(steps[i])) {
            cleanUpNextSteps(ctx, steps[i], null);

            continue;
        }

        if (steps[i].getKey() === currentStepKey) {
            cleanUpMarker = true;
        }

        if (cleanUpMarker) {
            steps[i].cleanUp(ctx);
        }
    }
}




module.exports = StepEngine;
