const {Graph, GraphVertex, GraphEdge} = require('../../../data-structures');

class StepEngine extends Graph{

    async run(ctx, currentStepKey) {

        let currentStep = getCurrentStep(this, currentStepKey);
        if (!currentStep) {
            currentStep = getRoot(this);
        }

        if (arePrevStepsFulfilled(ctx, this, currentStep)) {
            cleanUpNextSteps(ctx, this, currentStep);
            cleanUpStepHistory(ctx, this, currentStep);

            if (stepIsVisited(ctx, currentStep)) {
                await currentStep.handle(ctx);

                currentStep = getNextStep(ctx, this, currentStep);
            }

            if (currentStep) {
                await currentStep.render(ctx);
                if (ctx.scene.state.stepHistory) {
                    ctx.scene.state.stepHistory.push(currentStep.getKey());
                }
            }

            return;
        }

        let prevStep = getPrevStep(ctx, this, currentStep);
        if (prevStep) {
            this.run(ctx, prevStep.getKey());
        }
    }
}

function getRoot(graph) {
    return graph.getAllEdges()[0].startVertex;
}

function getCurrentStep(graph, currentStepKey) {
    return graph.getVertexByKey(currentStepKey);
}

function getPrevStep(ctx, graph, currentVertex) {
    if (!ctx.scene.state.stepHistory.length) {
        return null;
    }

    if (ctx.scene.state.stepHistory[0].getKey() === currentVertex.getKey()) {
        return null;
    }

    for (let i = 0; i < ctx.scene.state.stepHistory.length; i++) {
        if (ctx.scene.state.stepHistory[0].getKey() === currentVertex.getKey()) {
            return graph.getVertexByKey(ctx.scene.state.stepHistory[i - 1]);
        }
    }
    return null;
}

function getNextStep(ctx, graph, currentVertex) {
    let neighbors = graph.getNeighbors(currentVertex);

    if (neighbors.length === 0) {
        return null;
    }

    if (neighbors.length === 1) {
        return neighbors[0];
    }

    //TODO: think how to make this better.
    return graph.getVertexByKey(ctx.match[1]);
}

function arePrevStepsFulfilled(ctx, graph, currentVertex) {
    let root = getRoot(graph);
    if (root.getKey() === currentVertex.getKey()) {
        return true;
    }

    let historyKeys = ctx.scene.state.stepHistory;

    for (let i = 0; i < historyKeys.length - 1; i++) {
        let key = historyKeys[i];
        if (!graph.getVertexByKey(key).isFullfilled(ctx)) {
            return false;
        }
    }

    return true;
}

function cleanUpNextSteps(ctx, graph, currentVertex)
{
    graph.getNeighbors(currentVertex).forEach(vertex => {
        vertex.cleanUp(ctx);
        cleanUpNextSteps(ctx, graph, vertex);
    });
}

function cleanUpStepHistory(ctx, graph, currentVertex)
{
    ctx.scene.state.stepHistory = ctx.scene.state.stepHistory.slice(
        0,
        1 + ctx.scene.state.stepHistory.findIndex(element => {
            return element === currentVertex.getKey();
        })
    );
}

function stepIsVisited(ctx, currentVertex)
{
    return ctx.scene.state.stepHistory.filter((item) => item === currentVertex.getKey()).length > 0;
}

module.exports = StepEngine;
