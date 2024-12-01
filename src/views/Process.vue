<template>
    <div class="container">
        <div class="left">
            <div class="tip">
                The executive process of your sql command.
            </div>
            <button v-for="(btnText, index) in buttonTexts" :key="index"
                :class="['btn-tree', { 'btn-selected': selectedBtnIndex === index }]" @click="selectButton(index)">
                {{ btnText }}
            </button>
        </div>
        <div class="middle">
            <div class="middle-header">{{ searchCommand }}</div>
            <div class="middle_planner" v-if="selectedBtnIndex == 0">
                <PlannerTree :plannerTree="planner_tree" @getNowNode="updateNowNode" />
            </div>
            <div class="middle_planner" v-if="selectedBtnIndex == 1">
                <PlannerTree :plannerTree="optimized_planner_tree" @getNowNode="updateNowNode" />
            </div>
            <div class="middle_executor" v-if="selectedBtnIndex == 2">
                <ExecutorTree :executorTree="optimized_planner_tree" @getNowNode="updateNowNode" />
            </div>
        </div>
        <el-scrollbar class="right">
            <div v-if="hasSelectedNode">
                <h1 class="right-header">{{ curNodeTag }}</h1>
                <el-collapse v-model="activeCollapseItems">
                    <el-collapse-item title="Meta Information" name="collapse-item-meta">
                        <el-form label-width="auto" style="max-width: 600px" disabled>
                            <el-form-item v-for="(value, attr) in curNodeMeta" :label="attr">
                                <el-input :value="value" />
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                    <el-collapse-item :title="selectedBtnIndex === 2 ? 'Plan Attributions' : 'Attributions'"
                        name="collapse-item-attr">
                        <el-form label-width="auto" style="max-width: 600px" disabled>
                            <el-form-item v-for="(value, attr) in curNodeAttrs" :label="attr">
                                <el-input :value="value" />
                            </el-form-item>
                        </el-form>
                    </el-collapse-item>
                    <el-collapse-item title="Input Tables" name="collapse-item-input-table"
                        v-if="selectedBtnIndex === 2">
                        <el-collapse>
                            <el-collapse-item v-for="(value, key) in curInputTables" :title="key">
                                <el-table :data="value.data" height="350" border stripe>
                                    <el-table-column v-for="header in value.headers" :key="header" :prop="header"
                                        :label="header"></el-table-column>
                                </el-table>
                            </el-collapse-item>
                        </el-collapse>
                    </el-collapse-item>
                    <el-collapse-item title="Output Table" name="collapse-item-output-table"
                        v-if="selectedBtnIndex === 2">
                        <el-table :data="curOutputTable.data" height="450" border stripe>
                            <el-table-column v-for="header in curOutputTable.headers" :key="header" :prop="header"
                                :label="header"></el-table-column>
                        </el-table>
                    </el-collapse-item>
                </el-collapse>
            </div>
            <div class="tip-box" v-if="!hasSelectedNode">
                <h1 class="tip">Please select a node in the middle panel</h1>
            </div>
        </el-scrollbar>

    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCurSearchCommand } from '@/utils/localStorage';
import PlannerTree from '@/components/PlannerTree.vue';
import ExecutorTree from '@/components/ExecutorTree.vue';
import { useProcessDataStore } from '@/stores/processDataStore';

const activeCollapseItems = ref(["collapse-item-meta", 'collapse-item-attr'])

const processDataStore = useProcessDataStore();

const processInfo = processDataStore.getData();

const buttonTexts = ['Planner Tree', 'Optimized Planner Tree', 'Executor Tree'];
const selectedBtnIndex = ref(0);
function selectButton(index: number) {
    selectedBtnIndex.value = index;
    hasSelectedNode.value = false;
}

const searchCommand = getCurSearchCommand();


const planner_tree = (processInfo as any)?.planner_tree;
const optimized_planner_tree = (processInfo as any)?.optimized_planner_tree;
const executor_tree = (processInfo as any).executor_tree;

const ExecutorTreeMap = computeExecutorMap(executor_tree);

let hasSelectedNode = ref(false);
let curNodeInfo = ref();
let curNodeTag = ref('Unselected Node');
let curNodeAttrs = ref();
let curNodeMeta = ref();

let curOutputTable = ref();
let curInputTables = ref();

function computeExecutorMap(executorTree: any[]) {
    let map = new Map();
    for (let node of executorTree) {
        map.set(node.bound_planner_node_id, node);
    }
    return map;
}

function updateNowNode(nowNodeId: number) {
    hasSelectedNode.value = true;
    curNodeInfo.value = getCurNodeInfo(nowNodeId)
    let tag = curNodeInfo.value?.planner_node_tag
    let prefix = '';
    switch (tag) {
        case 'Projection':
            prefix = 'π  ';
            break;
        case 'Filter':
            prefix = 'σ  ';
            break;
        case 'NestedLoopJoin':
            prefix = '⋈  ';
            break;
        default:
            break;
    }
    tag = prefix + tag;

    if (selectedBtnIndex.value == 2) {
        const planNodeInfo = findTreeNodeById(optimized_planner_tree, nowNodeId);
        curNodeTag.value = `${tag} Executor Node`;
        curNodeAttrs.value = planNodeInfo?.planner_node_attr ?? {};
        curNodeMeta.value = {
            'plan node id': nowNodeId
        };
    } else {
        curNodeTag.value = `${tag} Plan Node`;
        curNodeAttrs.value = curNodeInfo.value?.planner_node_attr ?? {};
        curNodeMeta.value = {
            'node id': nowNodeId
        };
    }

}

function getCurNodeInfo(nodeId: number) {
    if (selectedBtnIndex.value == 0) {
        return findTreeNodeById(planner_tree, nodeId);
    } else if (selectedBtnIndex.value == 1) {
        return findTreeNodeById(optimized_planner_tree, nodeId);
    } else {
        const originalResult = ExecutorTreeMap.get(nodeId);

        const boundPlannerNodeId = originalResult.bound_planner_node_id || 0;
        const boundPlannerNode = findTreeNodeById(optimized_planner_tree, boundPlannerNodeId);
        const { planner_node_tag: boundPlannerNodeTag, children: boundPlannerNodeChildren } = boundPlannerNode;
        if (originalResult.output_table) {
            curOutputTable.value = convertToElTableData(originalResult.output_table)
        }

        curInputTables.value = {};
        if (boundPlannerNodeTag !== "SeqScan" && boundPlannerNodeTag !== "IndexScan") {
            for (let child of boundPlannerNodeChildren) {
                let childNodeId = child.planner_node_id;
                let childNodeTag = child.planner_node_tag;
                let childExecutor = ExecutorTreeMap.get(childNodeId);
                curInputTables.value[`From ${childNodeTag}(${childNodeId})`]
                    = convertToElTableData(childExecutor.output_table);
            }
        }

        return {
            ...originalResult,
            planner_node_tag: boundPlannerNodeTag
        };
    }
}

function findTreeNodeById(tree: any, nodeId: number): any | null {
    if (tree && tree.planner_node_id == nodeId) {
        return tree;
    }
    if (tree.children) {
        for (const child of tree.children) {
            const found = findTreeNodeById(child, nodeId);
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function convertToElTableData(table: any[][]) {

    if (!table || table.length === 0) {
        return [];
    }

    const headers = table[0];
    const data = table.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    const result = { headers, data };
    return result;
}

const expressionText = ref('');

</script>

<style scoped>
.expression-text {

    min-width: 90%;
    min-height: 20px;
    margin-left: 20px;
    max-height: 20%;
    font-size: large;
}

.right {
    width: 40%;
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    overflow: auto;
}

.middle_executor {
    width: 100%;
    height: 88%;
    border-top: #ccc 1px solid;
}

.btn-tree {
    width: 85%;
    margin: 10px auto;
    font-size: 16px;
    height: 50px;
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0px 2px 3px #ccc;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-tree:hover {
    filter: brightness(0.9);
}

.btn-selected {
    background-color: blue;
    color: white;
    cursor: default;
}

.container {
    display: flex;
    height: calc(100vh - 60px);
}

.left {
    width: 20%;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;

}


.left .tip {
    padding: 30px;
    font-size: 15px;
    font-weight: bold;
}

.middle {
    width: 50%;
    border-right: 1px solid #ccc;
    height: 100%;
}

.middle_planner {
    width: 100%;
    height: 88%;
    border-top: #ccc 1px solid;
}

.middle-header {
    width: 100%;
    overflow-y: auto;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    padding: 5px;
}

.tip-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.tip-box .tip {
    width: 50%;
}

:deep(.el-collapse-item__header) {
    font-size: 1.5em;
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    unicode-bidi: isolate;
}

:deep(.el-collapse-item__wrap) {
    transition: none !important;
}
</style>