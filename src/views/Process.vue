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
        <div class="right" :style="{ width: rightWidth }">
            <div class="right-header">{{ curNodeTag }}</div>
            <div class="right_planner" v-if="selectedBtnIndex == 0">
                <div style="padding-left: 20px; font-size: 18px;"> attributions</div>
            </div>
            <div class="right_planner" v-if="selectedBtnIndex == 1">
                <div style="padding-left: 20px; font-size: 18px;"> attributions</div>
            </div>
            <div class="right_executor" v-if="selectedBtnIndex == 2">
                <div style="padding:5px;padding-left: 20px; font-size: 18px;">plan attributions</div>
                <div style="padding:5px;padding-left: 20px;font-size: 14px;font-weight: bold;">expression</div>
                <textarea v-model="expressionText" class="expression-text" readonly></textarea>
                <div v-if="curNodeInfo && curNodeInfo.input_table">
                    <div style="padding:5px;padding-left: 20px; font-size: 18px;">input tables</div>
                    <el-table :data="curInputTable.data" style="width: 100%">
                        <el-table-column v-for="header in curInputTable.headers" :key="header" :prop="header"
                            :label="header"></el-table-column>
                    </el-table>

                </div>
                <div v-if="curNodeInfo && curNodeInfo.output_table">
                    <div style="padding:5px;padding-left: 20px; font-size: 18px;">output tables</div>
                    <el-table :data="curOutputTable.data" style="width: 100%">
                        <el-table-column v-for="header in curOutputTable.headers" :key="header" :prop="header"
                            :label="header"></el-table-column>
                    </el-table>
                </div>
            </div>
        </div>

    </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getCurSearchCommand } from '@/utils/localStorage';
import PlannerTree from '@/components/PlannerTree.vue';
import ExecutorTree from '@/components/ExecutorTree.vue';
import processInfo from '../../api/process_info.json';
const buttonTexts = ['Planner Tree', 'Optimized Planner Tree', 'Executor Tree'];
const selectedBtnIndex = ref(0);
function selectButton(index: number) {
    selectedBtnIndex.value = index;
}

const searchCommand = getCurSearchCommand();


const planner_tree = processInfo.data.process_info.planner_tree;
const optimized_planner_tree = processInfo.data.process_info.optimized_planner_tree;
let executor_tree: any;
executor_tree = processInfo.data.process_info.executor_tree;
let curNodeInfo = ref()
let curNodeTag = ref('Unselected Node')
let curOutputTable: any;
let curInputTable: any;
function updateNowNode(nowNode: number) {
    if (!executor_tree[nowNode]) {
        return;
    }

    curNodeInfo.value = getCurNodeInfo(nowNode)
    let tag = curNodeInfo.value?.planner_node_tag
    let prefix = '';
    switch (tag) {
        case 'Projection':
            prefix = 'Π  ';
            break;
        case 'Filter':
            prefix = 'φ  ';
            break;
        case 'NestedLoopJoin':
            prefix = '⋈  ';
            break;
        case 'SeqScan':
            prefix = 'Σ  ';
            break;
        default:
            break;
    }
    tag = prefix + tag;

    if (selectedBtnIndex.value == 2) {
        tag += ' Executor';
    } else {
        tag += ' Node'
    }
    curNodeTag.value = tag
}
const rightWidth = computed(() => {
    return selectedBtnIndex.value === 2 ? '40%' : '30%';
});

function getCurNodeInfo(nodeId: number) {
    if (selectedBtnIndex.value == 0) {
        return findTreeNodeById(planner_tree, nodeId);
    } else if (selectedBtnIndex.value == 1) {
        return findTreeNodeById(optimized_planner_tree, nodeId);
    } else {
        const originalResult = executor_tree[nodeId];

        const boundPlannerNodeId = originalResult.bound_planner_node_id || 0;
        const boundPlannerNodeTag = findTreeNodeById(optimized_planner_tree, boundPlannerNodeId)?.planner_node_tag;
        if (originalResult.output_table) {
            curOutputTable = convertToElTableData(originalResult.output_table)
        }

        if (originalResult.input_table) {
            curInputTable = convertToElTableData(originalResult.input_table)
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

    return {
        headers,
        data
    }
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
    height: 100%;
}

.right-header {
    padding: 20px;
    overflow-y: auto;
    font-size: 20px;
    height: 60px;
    width: 92%;
}

.middle_executor {
    width: 100%;
    height: 88%;
    border-top: #ccc 1px solid;
}

.right_executor {
    width: 100%;
    height: calc(95% - 60px);
    overflow-y: auto;
}

.right_planner {
    width: 100%;
    height: calc(95% - 60px);
    overflow-y: auto;
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
    background-color: #f0f0f0;
}

.btn-selected {
    background-color: blue;
    color: white;
}

.tip {
    padding: 30px;
    font-size: 15px;
    font-weight: bold;
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
    height: 10%;
    overflow-y: auto;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    padding: 5px;
}
</style>