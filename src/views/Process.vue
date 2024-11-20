<template>
    <svg id="mainsvg" width="500" height="1000"></svg>
    <!-- <div class="container">
    <div class="left"></div>
    <div class="middle">

    </div>
    <div class="right"></div>

  </div> -->
</template>

<script setup lang="ts">

import { ref, onMounted, onUpdated } from 'vue';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

const planner_tree = {
    "planner_node_tag": "Projection",
    "planner_node_id": 0,
    "attr": {
        "exprs": ["#0.0", "#0.1", "#0.2", "#0.3"]
    },
    "children": [{
        "planner_node_tag": "Filter",
        "planner_node_id": 1,
        "attr": {
            "predicate": ["(#0.0=#0.2)"]
        },
        "children": [{
            "planner_node_tag": "NestedLoopJoin",
            "planner_node_id": 2,
            "attr": {
                "type": "Inner",
                "predicate": true
            },
            "children": [{
                "planner_node_id": 3,
                "planner_node_tag": "SeqScan",
                "attr": {
                    "table": "students"
                }
            },
            {
                "planner_node_id": 4,
                "planner_node_tag": "SeqScan",
                "attr": {
                    "table": "courses_selected_record"
                }
            },
            ]
        }]
    }]
};


function treeToGraphData(tree: any) {
    const data = { nodes: [] as any[], edges: [] as any[], plannerNodeId: -1 };
    const nodeIdMap = new Map();
    let maxPlannerNodeId = -1;

    function traverseTree(node: { planner_node_id: any; planner_node_tag: any; children: any; }, parentId = null) {
        const nodeId = node.planner_node_id;
        const nodeIndex = data.nodes.length;
        data.nodes.push({ id: nodeId, label: node.planner_node_tag, shape: 'ellipse' });
        nodeIdMap.set(nodeId, nodeIndex);
        if (parentId !== null) {
            const parentIndex = nodeIdMap.get(parentId);
            data.edges.push({ source: nodeIndex, target: parentIndex, label: '' });
        }
        maxPlannerNodeId = Math.max(maxPlannerNodeId, nodeId);
        (node.children || []).forEach((child: { planner_node_id: any; planner_node_tag: any; children: any; }) => traverseTree(child, nodeId));
    }

    function traverseTable(node: { attr: { table: any; }; planner_node_id: any; children: any; }) {
        if (node.attr && node.attr.table) {
            maxPlannerNodeId = maxPlannerNodeId + 1;
            const newNodeId = maxPlannerNodeId;
            data.nodes.push({ id: newNodeId, label: node.attr.table, shape: 'rect' });
            data.edges.push({ source: newNodeId, target: node.planner_node_id, label: '' });
        }

        (node.children || []).forEach((child: { attr: { table: any; }; planner_node_id: any; children: any; }) => traverseTable(child));
    }

    traverseTree(tree);
    data.plannerNodeId = maxPlannerNodeId;
    traverseTable(tree);

    return data;
};

const data = treeToGraphData(planner_tree);
let container: any;
let nowNode = -1;

function getNodeStyle(item: any, isPlannerNode: boolean) {
    let baseStyle = `fill:${isPlannerNode ? 'rgb(147,210,243)' : 'rgb(162,239,77)'};stroke:none;cursor:pointer`;
    let labelStyle = `fill:rgb(0,0,0);font-weight:bold;cursor:pointer`;
    if (nowNode == item.id && isPlannerNode) {
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

    data.nodes.forEach((item: any) => {
        const isPlannerNode = item.id <= data.plannerNodeId;
        const { style, labelStyle } = getNodeStyle(item, isPlannerNode);
        graph.setNode(item.id, {
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


    container.selectAll('g.node').on('click', (e: any) => {
        nowNode = e.target.__data__;
        drawTree();
    });
}

onMounted(() => {
    drawTree();
});


</script>

<style scoped></style>
