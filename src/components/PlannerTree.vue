<template>
    <div class="container">
        <svg id="mainsvg"></svg>
    </div>

</template>

<script setup lang="ts">

import { onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

const props = defineProps({
    plannerTree: {
        type: Object,
        required: true,
    },
});


const planner_tree = props.plannerTree;
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
    }) 
    {
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

function getNodeStyle(item: any) {
    const isPlannerNode = item.id <= data.plannerNodeId;
    let baseStyle = `fill:${isPlannerNode ? 'rgb(147,210,243)' : 'rgb(162,239,77)'};stroke:none;cursor:pointer`;
    let labelStyle = `fill:rgb(0,0,0);font-weight:bold;cursor:pointer`;
    if (!isPlannerNode) {
        baseStyle += ";pointer-events:none;";
        labelStyle += ";pointer-events:none;";
    }
    if (nowNodeId == item.id && isPlannerNode) {
        baseStyle = `fill:rgb(147,210,243);stroke:purple;stroke-width:3px;stroke-dasharray:5,5;cursor:pointer`;
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
        const { style, labelStyle } = getNodeStyle(item);
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
        let newNowNodeId = Number.parseInt(e.currentTarget.getAttribute("data-node-id"));
        if (newNowNodeId !== nowNodeId) {
            nowNodeId = newNowNodeId;
            emit('getNowNode', nowNodeId);
            drawTree();
        }
    });
}

onMounted(() => {
    drawTree();
    window.addEventListener('resize', drawTree);
});

onUnmounted(() => {
    window.removeEventListener('resize', drawTree);
});


</script>

<style scoped>
.container {
    width: 100%;
    height: 100% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
}
</style>
