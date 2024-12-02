<template>
    <svg id="b-plus-tree-svg"></svg>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, toRefs } from 'vue';
import * as d3 from 'd3';
import dagreD3 from 'dagre-d3';

const props = defineProps({
    bplusTree: {
        type: Object,
        required: true,
    },
});

const { bplusTree: bplusTreeData } = toRefs(props);

let nowNodeId = -1;

let svgTransform: any = null;

const computeColGroupElementHTML = (n: number) => {
    let radio = 100 / n;
    let template = "";
    for (let i = 0; i < n; ++i) {
        template += `<col style="width: ${radio}%;">`;
    }
    return `<colgroup>${template}</colgroup>`;
}

const computeNodeHTML = (node: any) => {
    let id = node.header.page_id;
    let kv = node.key_value;
    let keysTemplate = "";
    for (let i = 0; i < kv.length; ++i) {
        keysTemplate += `<td>${kv[i].index}</td>`;
    }
    let template = `
        <table class="${nowNodeId === id ? 'selected' : 'common'}">
            ${computeColGroupElementHTML(kv.length)}
            <tbody>
                <tr><td colspan="${kv.length}">Page ID=${node.header.page_id}</td></tr>
                <tr>${keysTemplate}</tr>
            </tbody>
        </table>`;
    return template;
};

const computeClassAttr = (node: any) => {
    return node.header.page_type === "leaf_page" ? "leaf-node" : "internal-node";
};

const toNodeElemId = (id: string | number) => {
    return `bplus-tree-node-${id}`;
};

const getSvgNodeInfo = (svgCanvas : Element, id: string | number) => {
    const regex = /translate\(([^,]+),([^)]+)\)/;
    const elem = svgCanvas.querySelector(`g #${toNodeElemId(id)}`);
    
    if (!elem) {
        console.error(`Can't find svg element ${toNodeElemId(id)}`);
        return {x: 0, y: 0, width: 0, height: 0};
    }
    
    let matchResult = elem!.getAttribute("transform")!.match(regex);
    if (!matchResult) {
        console.error(`Invalid transform attribute.`);
        return {x: 0, y: 0, width: 0, height: 0};
    }
    let [_, _x, _y] = matchResult;
    let x = Number.parseFloat(_x);
    let y = Number.parseFloat(_y);

    let rectElem = elem.querySelector("rect");
    if (!rectElem) {
        console.error("Can't find rect element.");
        return {x: 0, y: 0, width: 0, height: 0};
    }
    let rectX = Number.parseFloat(rectElem.getAttribute("x") ?? '0');
    let rectY = Number.parseFloat(rectElem.getAttribute("y") ?? '0');
    let rectWidth = Number.parseFloat(rectElem.getAttribute("width") ?? '0');
    let rectHeight = Number.parseFloat(rectElem.getAttribute("height") ?? '0');

    x += rectX;
    y += rectY;

    return {x, y, width: rectWidth, height: rectHeight};

};

const drawArrowLine = (
    container: any, 
    {lineStartX, lineStartY, lineEndX, lineEndY} : {
        lineStartX: number, 
        lineStartY: number, 
        lineEndX: number, 
        lineEndY: number
    }
) => {
    container.append("line")
    .attr("x1", lineStartX)
    .attr("y1", lineStartY)
    .attr("x2", lineEndX)
    .attr("y2", lineEndY)
    .attr("stroke", "#333")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)"); // 关联箭头标记>
};

const renderBPlusTree = (data: any, svgElement: any) => {

    // Clear our canvas.
    d3.select(svgElement).selectAll('*').remove();

    const g: any = new dagreD3.graphlib.Graph();
    g.setGraph({
        rankdir: 'TB',        
        ranksep: 100,
    })
    .setDefaultEdgeLabel(() => ({}));

    // Process nodes.
    for (let node of [data.root, ...data.nodes]) {
        let {parent_page_id: parentId, page_id: nodeId} = node.header;
        g.setNode(nodeId, {
            labelType: 'html',
            label: computeNodeHTML(node),
            class: computeClassAttr(node),
            id: toNodeElemId(nodeId),
            paddingBottom: 0,
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 0,
        });
        if (parentId > 0) g.setEdge(parentId, nodeId);
    }

    // Use dagreD3 to render the figure.
    const render = new dagreD3.render();
    const svg = d3.select(svgElement);
    const inner: any = svg.append("g");
    if (svgTransform) {
        inner.attr("transform", svgTransform);
    }
    render(inner, g);

    // Bind click handler.
    inner.selectAll('g.node').on('click', (e: any) => {
        let elemId = e.currentTarget.id;
        let [_, nodeId] = elemId.match(/bplus\-tree\-node\-(\w+)/);
        nowNodeId = Number.parseInt(nodeId);
        renderBPlusTree(data, svgElement);
    });

    // Remove the default paths.
    document.querySelectorAll(".edgePaths .edgePath, .edgeLabels").forEach((elem) => {
        elem.remove();
    });

    // Create our own arrow element.
    const linesContainer = svg.select(".edgePaths");
    linesContainer
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 9)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 Z")
        .attr("fill", "#333");

    // Create our own paths.
    for (let node of [data.root, ...data.nodes]) {
        const kvArr = node.key_value;
        const { page_id: nodeId, page_type: nodeType } = node.header;
        const { x, y, width, height } = getSvgNodeInfo(svgElement, nodeId);

        let lineStartX, lineStartY;
        let lineEndX, lineEndY;

        if (nodeType === "leaf_page") {
            let nextNodeId = node.header.next_page_id
            if (nextNodeId <= 0) continue;
            let { 
                x: nextX,
                y: nextY, 
                height: nextHeight
            } = getSvgNodeInfo(svgElement, nextNodeId);
            lineStartX = x + width;
            lineStartY = y + height / 2;
            lineEndX = nextX;
            lineEndY = nextY + nextHeight / 2;
            drawArrowLine(linesContainer, { lineStartX, lineStartY, lineEndX, lineEndY });
        }
        else if (nodeType === "internal_page") {
            const unitWidth = width / kvArr.length;
            for (let i = 0; i < kvArr.length; ++i) {
                let { page_id: childNodeId } = kvArr[i];
                let { 
                    x: childX,
                    y: childY, 
                    width: childWidth
                } = getSvgNodeInfo(svgElement, childNodeId);
                lineStartX = x + unitWidth * (i + 0.5);
                lineStartY = y + height - 1;
                lineEndX = childX + childWidth / 2;
                lineEndY = childY;
                drawArrowLine(linesContainer, { lineStartX, lineStartY, lineEndX, lineEndY });
            }
        }
        else {
            console.error("Invalid node type.");
            continue;
        }

    }

    const zoom = d3.zoom().on("zoom", (e) => {
        inner.attr("transform", svgTransform = e.transform);
    });
    svg.call(zoom);

};

onMounted(() => {
    renderBPlusTree(bplusTreeData.value, document.querySelector("#b-plus-tree-svg"));
});


</script>

<style>
#b-plus-tree-svg {
    width: 100%;
    height: 100%;
}

#b-plus-tree-svg text {
    font-weight: 300;
    font-size: 14px;
}

#b-plus-tree-svg .node rect {
    fill: #fff;
    stroke-width: 1.5px;
}

#b-plus-tree-svg .edgePath path {
    stroke: #333;
    stroke-width: 1.5px;
}

#b-plus-tree-svg .node table {
    border-collapse: collapse;
    width: 100%;
    height: 100%;
}

#b-plus-tree-svg .node table td {
    padding: 4px;
    text-align: center;
    user-select: none;
}

#b-plus-tree-svg .node table.common td {
    border: 2px solid #333;
    cursor: pointer;
}

#b-plus-tree-svg .node table.selected td {
    color: rgb(184,134,248);
    border: 2px dashed rgb(184,134,248);
    cursor: default;
}
</style>