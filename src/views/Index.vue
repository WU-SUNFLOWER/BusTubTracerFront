<template>
    <div class="container">
        <div class="left">
            <div class="left-sub-container" style="height:30%">
                <div class="header">Catalog</div>
                <el-input 
                    v-model="searchInput"
                    clearable
                    style="width: 99%;margin:0.5%;"
                    placeholder="Search your table quickly"
                    :prefix-icon="Search"
                >
                </el-input>
                <el-table
                    :data="filteredTables"
                    style="width:99%;margin:0.5%;" 
                    border 
                    highlight-current-row
                    @current-change="handleCurrentTableChange"
                >
                    <el-table-column prop="table_oid" label="Table ID"></el-table-column>
                    <el-table-column prop="table_name" label="Table Name"></el-table-column>
                </el-table>                
            </div>
            <div class="left-sub-container" style="height:20%">
                <div class="header" style="border-top: 1px solid black;">Table Index</div>
                <div class="left-index-container">
                    <h1 v-if="!hasSelectedTable" class="tip-text">Please select a table.</h1>
                    <el-table 
                        v-if="hasSelectedTable"
                        v-loading="isTableContentAreaLoading"
                        :data="currentIndices"
                        border 
                        stripe
                        style="width:calc(100% - 2px);height:calc(99% - 2px);margin:1px;"
                        highlight-current-row
                        show-overflow-tooltip
                        @current-change="handleCurrentIndexChange"
                    >
                        <el-table-column 
                            v-for="header in indicesTableHeaders" 
                            :key="header" 
                            :prop="header"
                            :label="header">
                        </el-table-column>
                    </el-table>
                </div>                
            </div>
            <div class="left-sub-container" style="height:50%">
                <div class="header" style="border-top: 1px solid black;">Table Content</div>
                <div class="left-table-container">
                    <h1 v-if="!hasSelectedTable" class="tip-text">Please select a table.</h1>
                    <el-table
                        ref="contentTableRef"
                        v-if="hasSelectedTable"
                        v-loading="isTableContentAreaLoading"
                        :data="currentTable.data"
                        border
                        class="table-content-area"
                    >
                        <el-table-column label="Rid">
                            <el-table-column prop="rid.page_id" label="Page ID" width="85" />
                            <el-table-column prop="rid.slot_num" label="Slot Num" width="85" />
                        </el-table-column>
                        <el-table-column label="Tuple Content">
                            <el-table-column 
                                v-for="header in currentTable.headers" 
                                :key="header" 
                                :prop="header"
                                :label="header">
                            </el-table-column>                            
                        </el-table-column>
                    </el-table>
                </div>                
            </div>
        </div>
        <div class="right">
            <h1 v-if="!hasSelectedIndex" class="tip-text">Please select a index item.</h1>
            <div v-if="hasSelectedIndex" style="width:100%;height:100%;">
                <div class="header">B+ Tree Viewer <{{ currentTableNameOfRight }} : {{ currentIndexNameOfRight }}></div>
                <div class="right-svg-container">
                    <BPlusTree :bplusTree="currentBPlusTreeData" @selectNode="selectNode"/>
                </div>
                <div class="header header-with-top-border">B+ Tree Inspector</div>
                <div class="right-node-inspector">
                    <h1 
                        class="tip-text"
                        v-if="!hasSelectedNode"
                    >
                        Please select a node.
                    </h1>
                    <div v-if="hasSelectedNode" class="right-node-inspector-container">
                        <div class="right-node-inspector-sub-container">
                            <p class="title">Header Information</p>
                            <el-descriptions
                                class="margin-top"
                                :column="2"
                                border
                            >
                                <el-descriptions-item>
                                    <template #label>
                                        <div class="cell-item">Page ID</div>
                                    </template>
                                    {{ currentNode.header.page_id }}
                                </el-descriptions-item>
                                <el-descriptions-item>
                                    <template #label>
                                        <div class="cell-item">Parent Page ID</div>
                                    </template>
                                    {{ currentNode.header.parent_page_id }}
                                </el-descriptions-item>
                                <el-descriptions-item>
                                    <template #label>
                                        <div class="cell-item">Current Size</div>
                                    </template>
                                    {{ currentNode.header.current_size }}
                                </el-descriptions-item>
                                <el-descriptions-item>
                                    <template #label>
                                        <div class="cell-item">Max Size</div>
                                    </template>
                                    {{ currentNode.header.max_size }}
                                </el-descriptions-item>
                                <el-descriptions-item>
                                    <template #label>
                                        <div class="cell-item">Page Type</div>
                                    </template>
                                    {{ currentNode.header.page_type }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>
                        <div class="right-node-inspector-sub-container">
                            <p class="title">Key-Value Array</p>
                            <el-table 
                                :data="currentNode.key_value"
                                border
                                style="height:calc(100% - 40px)"
                                v-if="currentNode.header.page_type === 'internal_page'"
                            >
                                <el-table-column prop="index" label="Index"/>
                                <el-table-column prop="page_id" label="Page Id"/>
                            </el-table>
                            <el-table 
                                ref="kvTableRef"
                                :data="currentNode.key_value"
                                border
                                style="height:calc(100% - 40px)"
                                v-if="currentNode.header.page_type === 'leaf_page'"
                                highlight-current-row
                                @current-change="handleSelectLeafNode"
                            >
                                <el-table-column prop="index" label="Index"/>
                                <el-table-column label="Rid">
                                    <el-table-column prop="rid.page_id" label="Page Id"/>
                                    <el-table-column prop="rid.slot_num" label="Slot Number"/>
                                </el-table-column>
                            </el-table>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { queryResultToElTableData } from '@/utils/bustub';
import { Search } from '@element-plus/icons-vue'
import BPlusTree from '@/components/BPlusTree.vue';

onMounted(async () => {
    let result = await window.bustub.sendMessage("/get_all_tables", {});
    let allTableInfo = result.data;

    tablesInfo.value = loadAllTables(allTableInfo);

});

interface TableInfo {
    table_oid: number;
    table_name: string;
}
const searchInput = ref('');
const tablesInfo = ref<TableInfo[]>([]);

const filteredTables = computed(() => {
    if (!searchInput.value) {
        return tablesInfo.value;
    }
    return tablesInfo.value.filter(table =>
        createFilter(searchInput.value)(table)
    );
});

const createFilter = (queryString: string) => {
    return (tableInfo: TableInfo) => {
        const searchValue = tableInfo.table_name.toLowerCase();
        const searchOid = tableInfo.table_oid.toString().toLowerCase();
        const query = queryString.toLowerCase();
        return searchValue.includes(query) || searchOid.includes(query);
    };
};

const loadAllTables = (allTableInfo: any) => {
    return allTableInfo.tables.map((table: any) => ({
        table_name: table.table_name,
        table_oid: table.table_oid,
    }));
};

const hasSelectedTable = ref(false);
const hasSelectedIndex = ref(false);
const hasSelectedNode = ref(false);

const currentRow = ref({  table_oid: -1, table_name: '', });
const currentTable = ref({ name: '', data: [], headers: [] });
let currentTableNameOfRight = null;
let currentIndexNameOfRight = null;
const currentIndices = ref([]);
const indicesTableHeaders = ref(['index_name', 'index_oid', 'key_schema', 'key_size']);
const currentNode = ref({
    header: {
        current_size: null,
        max_size: null,
        page_id: null,
        parent_page_id: null,
        page_type: null,
    },
    key_value: [],
});

let currentBPlusTreeData = ref({});
let tableTuplesMap = new Map();
let bplusTreeNodeMap = new Map();

const isTableContentAreaLoading = ref(false);

const handleCurrentTableChange = async (val: TableInfo) => {
    if (!val) {
        return;
    } 
    
    // Show loading mask.
    isTableContentAreaLoading.value = true;

    if (currentTupleIndex >= 0) {
        const contentTableElem = contentTableRef.value.$el;
        const oldRowElem = contentTableElem.querySelector(`.el-table__body tr:nth-child(${currentTupleIndex + 1})`);
        oldRowElem.classList.remove("selected-tuple-row-in-index-panel");
        currentTupleIndex = -1;
    }

    hasSelectedTable.value = true;
    currentRow.value = val;
    
    let result = await window.bustub.sendMessage("/query_table_by_name", {
        'table_name': val?.table_name
    });

    tableTuplesMap.clear();
    currentTable.value = queryResultToElTableData(result);
    currentTable.value.name = val.table_name;

    result.data.tuples.forEach((tuple, index) => {
        let { page_id, slot_num } = tuple.rid;
        tableTuplesMap.set(`${page_id}_${slot_num}`, index);
    });

    currentIndices.value = result.data.indices;

    // Hide loading mask.
    isTableContentAreaLoading.value = false;
};

const handleCurrentIndexChange = async (val: any) => {
    
    // Repainting table can also trigger `current-change` event.
    // In this case, the value of `val` is null,
    // and we just need to do nothing for that.
    if (!val) {
        return;
    }
    
    let indexId = val.index_oid;
    let bplusTreeData = await window.bustub.sendMessage("/query_b_plus_tree", {
        'index_oid': indexId
    });
    currentBPlusTreeData.value = bplusTreeData.data;

    let { root, nodes } = bplusTreeData.data;
    bplusTreeNodeMap.clear();
    for (let node of [root, ...nodes]) {
        bplusTreeNodeMap.set(node.header.page_id, node);
    }

    // Record the relative table name.
    currentTableNameOfRight = currentTable.value.name;
    currentIndexNameOfRight = val.index_name;

    // Rendering b+ tree figure must be the final step.
    hasSelectedIndex.value = true;
}

const kvTableRef = ref();
const contentTableRef = ref();
let currentTupleIndex = -1;

const handleSelectLeafNode = (val) => {

    if (!val) {
        return;
    }

    // User has selected other table in the left panel.
    if (currentTableNameOfRight !== currentTable.value.name) {
        return;
    }

    const contentTableElem = contentTableRef.value.$el;
    const { page_id, slot_num } = val.rid;
    const tupleIndex = tableTuplesMap.get(`${page_id}_${slot_num}`);
    const rowElem = contentTableElem.querySelector(`.el-table__body tr:nth-child(${tupleIndex + 1})`);

    if (currentTupleIndex >= 0) {
        const oldRowElem = contentTableElem.querySelector(`.el-table__body tr:nth-child(${currentTupleIndex + 1})`);
        oldRowElem.classList.remove("selected-tuple-row-in-index-panel");
    }
    currentTupleIndex = tupleIndex;

    rowElem.classList.add("selected-tuple-row-in-index-panel");
    rowElem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });
}

const selectNode = (nodeId) => {
    hasSelectedNode.value = true;
    currentNode.value = bplusTreeNodeMap.get(nodeId);
};

</script>

<style>
.selected-tuple-row-in-index-panel {
    background: rgb(255, 0, 0) !important;
}
</style>

<style scoped>
.table-info-item-item-active {
    width: 50%;
    border: 1px solid rgb(190, 190, 190);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    background-color: rgb(117, 249, 253);
    cursor: pointer;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
}

.table-info {
    width: 70%;
    height: 70%;
    text-align: center;
}

.middle-scroll {
    width: 100%;
    height: calc(100% - 35px - 45px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;

}

.table-info-item-item {
    width: 50%;
    border: 1px solid rgb(190, 190, 190);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;

}

.table-info-item {
    width: 100%;
    margin-top: 30px;
    height: 50px;
    display: flex;
}

.footer-btn {
    width: 49%;
    color: #000;
    margin: 0.5%;
    background-color: rgb(117, 249, 253);
    border-radius: 5px;
    border: 1px solid black;
    height: 25px;
    font-weight: bold;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
}

.middle-header {
    background-color: rgb(190, 190, 190);
    width: 100%;
    height: 40px;
    border-top: 3px solid black;
    border-bottom: 1px solid black;
}

.header {
    font-weight: bold;
    text-align: center;
    line-height: 35px;
    height: 35px;
    border-bottom: 1px solid black;
    background-color: rgb(190, 190, 190);
}

.header-with-top-border {
    border-top: 1px solid black;
}

.container {
    position: relative;
    display: flex;
    height: calc(100vh - 70px);
}

.left {
    margin: 5px;
    width: 25%;
    border: 1px solid black;
    display: flex;
    flex-direction: column;
}

.left-sub-container {
    display: flex;
    flex-direction: column;    
}

.left-table-container, .left-index-container {
    position: relative;
    height: calc(100% - 35px);
}

.right {
    width: 75%;
    margin: 5px;
    border: 1px solid black;
    position: relative;
}

.custom-primary-button {
    background-color: rgb(117, 249, 253) !important;
    color: rgb(0, 0, 0) !important;
    font-weight: bold;
    border-radius: 0 5px 5px 0;
    margin-top: 1px;
}

:deep(.row-green) {
    background: rgba(19, 206, 102, 0.8);
}

.tip-text {
    margin: 0px;
    text-align: center;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
}

.right-svg-container {
    width: 100%;
    height: calc(100% - 35px - 35px - 30%);
}

.right-node-inspector {
    height: 30%;
    position: relative;
}

.right-node-inspector-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
}

.right-node-inspector-sub-container {
    margin: 25px;
    width: calc(50% - 50px);
    height: calc(100% - 50px);
}

.right-node-inspector-container p.title {
    line-height: 25px;
    margin-top: 0;
    margin-bottom: 15px;
    font-weight: bold;    
}

.cell-item {
  display: flex;
  align-items: center;
}

.table-content-area {
    width: calc(100% - 2px);
    height: calc(99% - 2px);
    margin: 1px;
}
</style>