<template>
    <div class="container">
        <svg id="mainsvg"></svg>
    </div>

</template>

<script setup lang="ts">

import { onMounted, onUnmounted, defineEmits } from 'vue';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

const props = defineProps({
    executorTree: {
        type: Object,
        required: true,
    },
});

const planner_tree = props.executorTree;
function treeToGraphData(tree: any) {
    const data = {
        nodes: [] as any[],
        edges: [] as any[],
        plannerNodeId: -1
    };
    const nodeIdMap = new Map();
    let maxNodeId = -1;

    function traverseTree(node: { planner_node_id: any; planner_node_tag: any; children: any; }, parentId = null) {
        const nodeId = node.planner_node_id;
        const nodeIndex = data.nodes.length;
        data.nodes.push({
            id: nodeId,
            label: `${node.planner_node_tag}(${nodeId})`,
            shape: 'ellipse'
        });
        nodeIdMap.set(nodeId, nodeIndex);
        if (parentId !== null) {
            const parentIndex = nodeIdMap.get(parentId);
            data.edges.push({
                source: nodeIndex,
                target: parentIndex,
                label: ''
            });
        }
        maxNodeId = Math.max(maxNodeId, nodeId);
        if (node.children) {
            node.children.forEach((child: { planner_node_id: any; planner_node_tag: any; children: any; }) => {
                traverseTree(child, nodeId);
            });
        }
    }

    function traverseTable(node: {
        planner_node_attr: {
            [x: string]: any;
            table: any;
        };
        planner_node_id: any;
        children: any;
    }) {
        if (node?.planner_node_attr?.table) {
            const newNodeIndex = data.nodes.length;
            data.nodes.push({
                id: ++maxNodeId,
                label: node.planner_node_attr.table,
                shape: 'rect'
            });
            data.edges.push({
                source: newNodeIndex,
                target: nodeIdMap.get(node.planner_node_id),
                label: ''
            });
        }

        if (node.children) {
            node.children.forEach((child: { planner_node_attr: { table: any; }; planner_node_id: any; children: any; }) => {
                traverseTable(child);
            });
        }
    }

    traverseTree(tree);
    data.plannerNodeId = maxNodeId;
    traverseTable(tree);

    return data;
};

const data = treeToGraphData(planner_tree);
let container: any;
let nowNodeId = -1;
const emit = defineEmits(['getNowNode']);

function getNodeStyle(id: number) {
    const isPlannerNode = id <= data.plannerNodeId;
    let baseStyle = `fill:${isPlannerNode ? 'rgb(184,134,248)' : 'rgb(162,239,77)'};stroke:none;cursor:pointer`;
    let labelStyle = `fill:rgb(0,0,0);font-weight:bold;cursor:pointer`;
    if (!isPlannerNode) {
        baseStyle += ";pointer-events:none;";
        labelStyle += ";pointer-events:none;";
    }
    if (nowNodeId == id && isPlannerNode) {
        baseStyle = `fill:rgb(184,134,248);stroke:purple;stroke-width:3px;stroke-dasharray:5,5;cursor:pointer`;
    }
    return {
        style: baseStyle,
        labelStyle: labelStyle,
    };
}

function drawTree() {
    // 清除之前的渲染
    d3.select('#mainsvg').selectAll('*').remove();
    var graph: any;
    graph = new dagreD3.graphlib.Graph();
    graph.setGraph({ rankdir: 'BT' });

    data.nodes.forEach((item: any, index: number) => {
        const { style, labelStyle } = getNodeStyle(item.id);
        graph.setNode(index, {
            label: item.label,
            shape: item.shape,
            style,
            labelStyle,
        });
    });

    data.edges.forEach((item: any) => {
        graph.setEdge(item.source, item.target, {
            label: item.label,
            style: "fill:#fff;stroke:rgb(249,74,86);stroke-width:1.5px",
            arrowheadStyle: "fill: rgb(249,74,86);",
        });
    });

    const render = new dagreD3.render();
    container = d3.select('#mainsvg').append('g');
    render(container, graph);

    container.selectAll('g.node').each(function (this: SVGGElement, index: any) {
        const nodeId = data.nodes[index].id;
        d3.select(this).attr("data-node-id", nodeId);
    });

    const gBBox = container.node().getBBox();
    d3.select('#mainsvg').attr('viewBox', `0 0 ${gBBox.width} ${gBBox.height}`);
    d3.select('#mainsvg').attr('width', gBBox.width);
    d3.select('#mainsvg').attr('height', gBBox.height);

    container.selectAll('g.node').on('click', (e: any) => {
        let elem = e.currentTarget;
        let newNowNodeId = Number.parseInt(elem.getAttribute("data-node-id"));
        if (newNowNodeId !== nowNodeId) {
            if (nowNodeId > 0) {
                let oldElem = document.querySelector('#mainsvg')?.querySelector(`[data-node-id="${nowNodeId}"]`);
                oldElem?.querySelector('ellipse')?.setAttribute('style', getNodeStyle(newNowNodeId).style);
            }
            nowNodeId = newNowNodeId;
            elem.querySelector('ellipse').setAttribute('style', getNodeStyle(nowNodeId).style);
        }
        requestAnimationFrame(() => emit('getNowNode', nowNodeId));
    });
}

const zoomController = d3.zoom().on("zoom", (e) => {
    container.attr("transform", e.transform);
});


onMounted(() => {
    let svgElement: any;
    svgElement = document.querySelector("#mainsvg")
    d3.select(svgElement).call(zoomController);
    drawTree();
    window.addEventListener('resize', drawTree);


});

onUnmounted(() => {
    window.removeEventListener('resize', drawTree);
});




</script>

<style scoped>
#mainsvg {
    width: 100% !important;
    height: 100% !important;
}

.container {
    width: 100%;
    height: 100% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}
</style>
