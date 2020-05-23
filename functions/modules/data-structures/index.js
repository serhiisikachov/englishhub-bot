class Graph {
    /**
     * @param {boolean} isDirected
     */
    constructor(isDirected = false) {
        this.vertices = {};
        this.edges = {};
        this.isDirected = isDirected;
    }

    /**
     * @param {GraphVertex} newVertex
     * @returns {Graph}
     */
    addVertex(newVertex) {
        this.vertices[newVertex.getKey()] = newVertex;

        return this;
    }

    /**
     * @param {string} vertexKey
     * @returns GraphVertex
     */
    getVertexByKey(vertexKey) {
        return this.vertices[vertexKey];
    }

    /**
     * @param {GraphVertex} vertex
     * @returns {GraphVertex[]}
     */
    getNeighbors(vertex) {
        return vertex.getNeighbors();
    }

    /**
     * @return {GraphVertex[]}
     */
    getAllVertices() {
        return Object.values(this.vertices);
    }

    /**
     * @return {GraphEdge[]}
     */
    getAllEdges() {
        return Object.values(this.edges);
    }

    /**
     * @param {GraphEdge} edge
     * @returns {Graph}
     */
    addEdge(edge) {
        // Try to find and end start vertices.
        let startVertex = this.getVertexByKey(edge.startVertex.getKey());
        let endVertex = this.getVertexByKey(edge.endVertex.getKey());

        // Insert start vertex if it wasn't inserted.
        if (!startVertex) {
            this.addVertex(edge.startVertex);
            startVertex = this.getVertexByKey(edge.startVertex.getKey());
        }

        // Insert end vertex if it wasn't inserted.
        if (!endVertex) {
            this.addVertex(edge.endVertex);
            endVertex = this.getVertexByKey(edge.endVertex.getKey());
        }

        // Check if edge has been already added.
        if (this.edges[edge.getKey()]) {
            throw new Error('Edge has already been added before');
        } else {
            this.edges[edge.getKey()] = edge;
        }

        // Add edge to the vertices.
        if (this.isDirected) {
            // If graph IS directed then add the edge only to start vertex.
            startVertex.addEdge(edge);
        } else {
            // If graph ISN'T directed then add the edge to both vertices.
            startVertex.addEdge(edge);
            endVertex.addEdge(edge);
        }

        return this;
    }

    /**
     * @param {GraphEdge} edge
     */
    deleteEdge(edge) {
        // Delete edge from the list of edges.
        if (this.edges[edge.getKey()]) {
            delete this.edges[edge.getKey()];
        } else {
            throw new Error('Edge not found in graph');
        }

        // Try to find and end start vertices and delete edge from them.
        const startVertex = this.getVertexByKey(edge.startVertex.getKey());
        const endVertex = this.getVertexByKey(edge.endVertex.getKey());

        startVertex.deleteEdge(edge);
        endVertex.deleteEdge(edge);
    }

    /**
     * @param {GraphVertex} startVertex
     * @param {GraphVertex} endVertex
     * @return {(GraphEdge|null)}
     */
    findEdge(startVertex, endVertex) {
        const vertex = this.getVertexByKey(startVertex.getKey());

        if (!vertex) {
            return null;
        }

        return vertex.findEdge(endVertex);
    }

    /**
     * @return {number}
     */
    getWeight() {
        return this.getAllEdges().reduce((weight, graphEdge) => {
            return weight + graphEdge.weight;
        }, 0);
    }

    /**
     * Reverse all the edges in directed graph.
     * @return {Graph}
     */
    reverse() {
        /** @param {GraphEdge} edge */
        this.getAllEdges().forEach((edge) => {
            // Delete straight edge from graph and from vertices.
            this.deleteEdge(edge);

            // Reverse the edge.
            edge.reverse();

            // Add reversed edge back to the graph and its vertices.
            this.addEdge(edge);
        });

        return this;
    }

    /**
     * @return {object}
     */
    getVerticesIndices() {
        const verticesIndices = {};
        this.getAllVertices().forEach((vertex, index) => {
            verticesIndices[vertex.getKey()] = index;
        });

        return verticesIndices;
    }

    /**
     * @return {*[][]}
     */
    getAdjacencyMatrix() {
        const vertices = this.getAllVertices();
        const verticesIndices = this.getVerticesIndices();

        // Init matrix with infinities meaning that there is no ways of
        // getting from one vertex to another yet.
        const adjacencyMatrix = Array(vertices.length).fill(null).map(() => {
            return Array(vertices.length).fill(Infinity);
        });

        // Fill the columns.
        vertices.forEach((vertex, vertexIndex) => {
            vertex.getNeighbors().forEach((neighbor) => {
                const neighborIndex = verticesIndices[neighbor.getKey()];
                adjacencyMatrix[vertexIndex][neighborIndex] = this.findEdge(vertex, neighbor).weight;
            });
        });

        return adjacencyMatrix;
    }

    /**
     * @return {string}
     */
    toString() {
        return Object.keys(this.vertices).toString();
    }
}

class GraphEdge {
    /**
     * @param {GraphVertex} startVertex
     * @param {GraphVertex} endVertex
     * @param {number} [weight=1]
     */
    constructor(startVertex, endVertex, weight = 0) {
        this.startVertex = startVertex;
        this.endVertex = endVertex;
        this.weight = weight;
    }

    /**
     * @return {string}
     */
    getKey() {
        const startVertexKey = this.startVertex.getKey();
        const endVertexKey = this.endVertex.getKey();

        return `${startVertexKey}_${endVertexKey}`;
    }

    /**
     * @return {GraphEdge}
     */
    reverse() {
        const tmp = this.startVertex;
        this.startVertex = this.endVertex;
        this.endVertex = tmp;

        return this;
    }

    /**
     * @return {string}
     */
    toString() {
        return this.getKey();
    }
}

class GraphVertex {
    /**
     * @param {*} value
     */
    constructor(value) {
        if (value === undefined) {
            throw new Error('Graph vertex must have a value');
        }

        /**
         * @param {GraphEdge} edgeA
         * @param {GraphEdge} edgeB
         */
        const edgeComparator = (edgeA, edgeB) => {
            if (edgeA.getKey() === edgeB.getKey()) {
                return 0;
            }

            return edgeA.getKey() < edgeB.getKey() ? -1 : 1;
        };

        // Normally you would store string value like vertex name.
        // But generally it may be any object as well
        this.value = value;
        this.edges = new LinkedList(edgeComparator);
    }

    /**
     * @param {GraphEdge} edge
     * @returns {GraphVertex}
     */
    addEdge(edge) {
        this.edges.append(edge);

        return this;
    }

    /**
     * @param {GraphEdge} edge
     */
    deleteEdge(edge) {
        this.edges.delete(edge);
    }

    /**
     * @returns {GraphVertex[]}
     */
    getNeighbors() {
        const edges = this.edges.toArray();

        /** @param {LinkedListNode} node */
        const neighborsConverter = (node) => {
            return node.value.startVertex === this ? node.value.endVertex : node.value.startVertex;
        };

        // Return either start or end vertex.
        // For undirected graphs it is possible that current vertex will be the end one.
        return edges.map(neighborsConverter);
    }

    /**
     * @return {GraphEdge[]}
     */
    getEdges() {
        return this.edges.toArray().map(linkedListNode => linkedListNode.value);
    }

    /**
     * @return {number}
     */
    getDegree() {
        return this.edges.toArray().length;
    }

    /**
     * @param {GraphEdge} requiredEdge
     * @returns {boolean}
     */
    hasEdge(requiredEdge) {
        const edgeNode = this.edges.find({
            callback: edge => edge === requiredEdge,
        });

        return !!edgeNode;
    }

    /**
     * @param {GraphVertex} vertex
     * @returns {boolean}
     */
    hasNeighbor(vertex) {
        const vertexNode = this.edges.find({
            callback: edge => edge.startVertex === vertex || edge.endVertex === vertex,
        });

        return !!vertexNode;
    }

    /**
     * @param {GraphVertex} vertex
     * @returns {(GraphEdge|null)}
     */
    findEdge(vertex) {
        const edgeFinder = (edge) => {
            return edge.startVertex === vertex || edge.endVertex === vertex;
        };

        const edge = this.edges.find({ callback: edgeFinder });

        return edge ? edge.value : null;
    }

    /**
     * @returns {string}
     */
    getKey() {
        return this.value;
    }

    /**
     * @return {GraphVertex}
     */
    deleteAllEdges() {
        this.getEdges().forEach(edge => this.deleteEdge(edge));

        return this;
    }

    /**
     * @param {function} [callback]
     * @returns {string}
     */
    toString(callback) {
        return callback ? callback(this.value) : `${this.value}`;
    }
}

class LinkedList {
    /**
     * @param {Function} [comparatorFunction]
     */
    constructor(comparatorFunction) {
        /** @var LinkedListNode */
        this.head = null;

        /** @var LinkedListNode */
        this.tail = null;

        this.compare = new Comparator(comparatorFunction);
    }

    /**
     * @param {*} value
     * @return {LinkedList}
     */
    prepend(value) {
        // Make new node to be a head.
        const newNode = new LinkedListNode(value, this.head);
        this.head = newNode;

        // If there is no tail yet let's make new node a tail.
        if (!this.tail) {
            this.tail = newNode;
        }

        return this;
    }

    /**
     * @param {*} value
     * @return {LinkedList}
     */
    append(value) {
        const newNode = new LinkedListNode(value);

        // If there is no head yet let's make new node a head.
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;

            return this;
        }

        // Attach new node to the end of linked list.
        this.tail.next = newNode;
        this.tail = newNode;

        return this;
    }

    /**
     * @param {*} value
     * @return {LinkedListNode}
     */
    delete(value) {
        if (!this.head) {
            return null;
        }

        let deletedNode = null;

        // If the head must be deleted then make next node that is differ
        // from the head to be a new head.
        while (this.head && this.compare.equal(this.head.value, value)) {
            deletedNode = this.head;
            this.head = this.head.next;
        }

        let currentNode = this.head;

        if (currentNode !== null) {
            // If next node must be deleted then make next node to be a next next one.
            while (currentNode.next) {
                if (this.compare.equal(currentNode.next.value, value)) {
                    deletedNode = currentNode.next;
                    currentNode.next = currentNode.next.next;
                } else {
                    currentNode = currentNode.next;
                }
            }
        }

        // Check if tail must be deleted.
        if (this.compare.equal(this.tail.value, value)) {
            this.tail = currentNode;
        }

        return deletedNode;
    }

    /**
     * @param {Object} findParams
     * @param {*} findParams.value
     * @param {function} [findParams.callback]
     * @return {LinkedListNode}
     */
    find({ value = undefined, callback = undefined }) {
        if (!this.head) {
            return null;
        }

        let currentNode = this.head;

        while (currentNode) {
            // If callback is specified then try to find node by callback.
            if (callback && callback(currentNode.value)) {
                return currentNode;
            }

            // If value is specified then try to compare by value..
            if (value !== undefined && this.compare.equal(currentNode.value, value)) {
                return currentNode;
            }

            currentNode = currentNode.next;
        }

        return null;
    }

    /**
     * @return {LinkedListNode}
     */
    deleteTail() {
        const deletedTail = this.tail;

        if (this.head === this.tail) {
            // There is only one node in linked list.
            this.head = null;
            this.tail = null;

            return deletedTail;
        }

        // If there are many nodes in linked list...

        // Rewind to the last node and delete "next" link for the node before the last one.
        let currentNode = this.head;
        while (currentNode.next) {
            if (!currentNode.next.next) {
                currentNode.next = null;
            } else {
                currentNode = currentNode.next;
            }
        }

        this.tail = currentNode;

        return deletedTail;
    }

    /**
     * @return {LinkedListNode}
     */
    deleteHead() {
        if (!this.head) {
            return null;
        }

        const deletedHead = this.head;

        if (this.head.next) {
            this.head = this.head.next;
        } else {
            this.head = null;
            this.tail = null;
        }

        return deletedHead;
    }

    /**
     * @param {*[]} values - Array of values that need to be converted to linked list.
     * @return {LinkedList}
     */
    fromArray(values) {
        values.forEach(value => this.append(value));

        return this;
    }

    /**
     * @return {LinkedListNode[]}
     */
    toArray() {
        const nodes = [];

        let currentNode = this.head;
        while (currentNode) {
            nodes.push(currentNode);
            currentNode = currentNode.next;
        }

        return nodes;
    }

    /**
     * @param {function} [callback]
     * @return {string}
     */
    toString(callback) {
        return this.toArray().map(node => node.toString(callback)).toString();
    }

    /**
     * Reverse a linked list.
     * @returns {LinkedList}
     */
    reverse() {
        let currNode = this.head;
        let prevNode = null;
        let nextNode = null;

        while (currNode) {
            // Store next node.
            nextNode = currNode.next;

            // Change next node of the current node so it would link to previous node.
            currNode.next = prevNode;

            // Move prevNode and currNode nodes one step forward.
            prevNode = currNode;
            currNode = nextNode;
        }

        // Reset head and tail.
        this.tail = this.head;
        this.head = prevNode;

        return this;
    }
}

class LinkedListNode {
    constructor(value, next = null) {
        this.value = value;
        this.next = next;
    }

    toString(callback) {
        return callback ? callback(this.value) : `${this.value}`;
    }
}

class Comparator {
    /**
     * @param {function(a: *, b: *)} [compareFunction] - It may be custom compare function that, let's
     * say may compare custom objects together.
     */
    constructor(compareFunction) {
        this.compare = compareFunction || Comparator.defaultCompareFunction;
    }

    /**
     * Default comparison function. It just assumes that "a" and "b" are strings or numbers.
     * @param {(string|number)} a
     * @param {(string|number)} b
     * @returns {number}
     */
    static defaultCompareFunction(a, b) {
        if (a === b) {
            return 0;
        }

        return a < b ? -1 : 1;
    }

    /**
     * Checks if two variables are equal.
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    equal(a, b) {
        return this.compare(a, b) === 0;
    }

    /**
     * Checks if variable "a" is less than "b".
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    lessThan(a, b) {
        return this.compare(a, b) < 0;
    }

    /**
     * Checks if variable "a" is greater than "b".
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    greaterThan(a, b) {
        return this.compare(a, b) > 0;
    }

    /**
     * Checks if variable "a" is less than or equal to "b".
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    lessThanOrEqual(a, b) {
        return this.lessThan(a, b) || this.equal(a, b);
    }

    /**
     * Checks if variable "a" is greater than or equal to "b".
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
    greaterThanOrEqual(a, b) {
        return this.greaterThan(a, b) || this.equal(a, b);
    }

    /**
     * Reverses the comparison order.
     */
    reverse() {
        const compareOriginal = this.compare;
        this.compare = (a, b) => compareOriginal(b, a);
    }
}

module.exports = {
    Graph,
    GraphVertex,
    GraphEdge
};
