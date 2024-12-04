<template>
    <div class="container">
        <div class="left">
            <div class="header">Catalog</div>
            <el-input v-model="searchInput" clearable style="width: 99%;margin:0.5%;"
                placeholder="Search your table quickly" :prefix-icon="Search">
            </el-input>
            <el-table :data="filteredTables" style="width:99%;margin:0.5%;height:calc(50% - 35px - 40px - 25px);" border
                highlight-current-row @current-change="handleCurrentChange">
                <el-table-column prop="table_oid" label="Table ID"></el-table-column>
                <el-table-column prop="table_name" label="Table Name"></el-table-column>
            </el-table>
            <div class="header" style="border-top: 1px solid black;">Table Content</div>
            <div class="right-table-container">
                <h1 v-if="!hasSelectedRow" class="tip-text">Please select a table.</h1>
                <el-table v-if="hasSelectedRow" :data="currentTable.data" border stripe
                    style="width:99%;height: 99%;margin:0.5%;">
                    <el-table-column v-for="header in currentTable.headers" :key="header" :prop="header"
                        :label="header">
                    </el-table-column>
                </el-table>
            </div>

        </div>
        <div class="middle">
            <h1 v-if="!hasSelectedRow" class="tip-text">Please select a table.</h1>
            <div v-if="hasSelectedRow" style="height: 100%;">
                <div class="header">The Currently Selected Table: {{ currentRow.table_name }}</div>
                <div class="middle-header">
                    <el-breadcrumb :separator-icon="ArrowRight" class="custom-breadcrumb">
                        <el-breadcrumb-item v-if="hasSelectedRow" @click="gotoTableInfo" class="middle-header-tag">Table
                            Info</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="hasSelectedTableHeap" class="middle-header-tag"
                            @click="gotoTableHeap">Table
                            Heap</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="hasSelectedTablePage" @click="gotoTablePage(tablePageInfo.page_id)"
                            class="middle-header-tag">Table
                            Page{{ tablePageInfo.page_id }}</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="hasSelectedTableTuple"
                            @click="gotoTableTuple(tableTupleInfo.slot_num)" class="middle-header-tag">Tuple{{
                                tableTupleInfo.slot_num + 1 }}</el-breadcrumb-item>
                        <el-breadcrumb-item v-if="hasSelectedTableValue" class="middle-header-tag">Value{{
                            TableValueInfo + 1 }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <el-scrollbar class="middle-scroll">
                    <div v-if="hasSelectedTableValue" class="table-info">
                        <div class="table-info-item">
                            <div class="table-info-item-item">value</div>
                            <div class="table-info-item-item">{{ tableTupleInfo.values[TableValueInfo].value }}</div>
                        </div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">size</div>
                            <div class="table-info-item-item">{{ tableTupleInfo.values[TableValueInfo].size }}</div>
                        </div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">type</div>
                            <div class="table-info-item-item">{{ tableTupleInfo.values[TableValueInfo].type }}</div>
                        </div>
                    </div>
                    <div v-else-if="hasSelectedTableTuple" class="page-content">
                        <div class="page-header">
                            Properties
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">allocated</div>
                            <div class="table-info-item-item1">{{ tableTupleInfo.allocated }}</div>
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">rid</div>
                            <div class="table-info-item-item1">
                                <div class="table-info-item1">
                                    <div class="table-info-item-item1">page id={{ tableTupleInfo.page_id }}</div>
                                    <div class="table-info-item-item1">slot num={{ tableTupleInfo.slot_num }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">size</div>
                            <div class="table-info-item-item1">{{ tableTupleInfo.size }}B</div>
                        </div>
                        <div class="page-header">
                            Data
                        </div>
                        <div class="table-info-item1" v-for="(value, index) in tableTupleInfo.values">
                            <div class="table-info-item-item1">value {{ index + 1 }}</div>
                            <div class="table-info-item-item-active2" @click="gotoTableValue(index)">...</div>
                        </div>
                    </div>
                    <div class="page-content" v-else-if="hasSelectedTablePage">
                        <div class="page-header">
                            Header (Size=24B)
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">PageId</div>
                            <div class="table-info-item-item1">{{ tablePageInfo.page_id }}</div>
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">PrePageId</div>
                            <div class="table-info-item-item1">{{ tablePageInfo.pre_page_id }}</div>
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">NextPageId</div>
                            <div class="table-info-item-item1">{{ tablePageInfo.next_page_id }}</div>
                        </div>
                        <div class="table-info-item1">
                            <div class="table-info-item-item1">TupleCount</div>
                            <div class="table-info-item-item1">{{ tablePageInfo.tuple_count }}</div>
                        </div>
                        <div class="page-header">
                            Free Space (Size={{ tablePageInfo.size_of_free_space }}B)
                        </div>
                        <div class="page-header">
                            Tuple Array (Size={{ tablePageInfo.size_of_tuple_array }}B)
                        </div>
                        <div class="table-info-item1" v-for="(_, index) in Array(tablePageInfo.tuple_count).fill(null)"
                            :key="index">
                            <div class="table-info-item-item2">&nbsp;&nbsp;tuple {{ tablePageInfo.tuple_count -
                                index }}
                            </div>
                            <div class="table-info-item-item-active2"
                                @click="gotoTableTuple(tablePageInfo.tuple_count - index - 1)">...</div>
                        </div>
                    </div>
                    <div class="table-info" v-else-if="hasSelectedTableHeap">
                        <div v-for="(value, index) in tableHeapInfo.table_page_ids">
                            <div class="table-page-arrow" v-if="index != 0">↑↓</div>
                            <div class="table-info-item">
                                <div class="table-info-item-item">table page {{ value }}</div>
                                <div class="table-info-item-item-active" @click="gotoTablePage(value)">...</div>
                            </div>
                        </div>
                    </div>
                    <div class="table-info" v-else-if="hasSelectedRow">
                        <div style="font-weight: bold;font-size: 18px;">The Properties of Your Table</div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">Table Name</div>
                            <div class="table-info-item-item">{{ currentRow.table_name }}</div>
                        </div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">Table ID</div>
                            <div class="table-info-item-item">{{ currentRow.table_oid }}</div>
                        </div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">Table Head</div>
                            <div class="table-info-item-item-active" @click="gotoTableHeap">...</div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </div>

        <div class="right">
            <div class="header" style="background-color:rgb(190,190,190);">Buffer Pool</div>
            <el-table :data="bufferPoolInfo" :row-class-name="getTableRowClassName"
                style="width: 99%;margin: 0.5%;height: calc(100% - 45px);" border>
                <el-table-column prop="frame_id" label="Frame ID"></el-table-column>
                <el-table-column prop="page_id" label="Page ID"></el-table-column>
                <el-table-column prop="is_dirty" label="Is Dirty"></el-table-column>
                <el-table-column prop="pin_count" label="Pin Count"></el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { queryResultToElTableData } from '@/utils/bustub';
import { Search, ArrowRight } from '@element-plus/icons-vue';


let bufferPoolInfo: any = ref([]);

onMounted(async () => {
    let result = await window.bustub.sendMessage("/get_all_tables", {});
    let allTableInfo = result.data;

    result = await window.bustub.sendMessage("/get_buffer_pool_info", {});
    bufferPoolInfo.value = result.data.buffer_pool_info;

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

const hasSelectedRow = ref(false);
const currentRow = ref({ table_oid: -1, table_name: '', });
const currentTable = ref({
    data: [],
    headers: [],
    table_name: '',
    table_oid: -1,
});
const handleCurrentChange = async (val: TableInfo) => {
    if (val) hasSelectedRow.value = true;
    currentRow.value = val;

    let result = await window.bustub.sendMessage("/query_table_by_name", {
        'table_name': val?.table_name
    });
    const res = queryResultToElTableData(result);
    currentTable.value.headers = res.headers;
    currentTable.value.data = res.data;
    currentTable.value.table_name = result.data.table_name;
    currentTable.value.table_oid = result.data.table_oid;

    if (hasSelectedTablePage.value) {
        gotoTableInfo()
    }
    else if (hasSelectedTableHeap.value) {
        gotoTableHeap()
    }
};

const getTableRowClassName = ({ row }: { row: any }) => {
    return row.is_free ? "row-green" : "row-common";
};

const hasSelectedTableHeap = ref(false);
const hasSelectedTablePage = ref(false);
const hasSelectedTableTuple = ref(false);
const hasSelectedTableValue = ref(false)
const tableHeapInfo = ref();
const tablePageInfo = ref();
const tableTupleInfo = ref();
const TableValueInfo = ref();

const gotoTableInfo = () => {
    hasSelectedTableHeap.value = false;
    hasSelectedTablePage.value = false;
    hasSelectedTableTuple.value = false;
    hasSelectedTableValue.value = false;
};

const gotoTableHeap = async () => {
    const result = await window.bustub.sendMessage("/get_table_heap_info", {
        "table_oid": currentTable.value.table_oid
    });
    tableHeapInfo.value = result.data;
    hasSelectedTableValue.value = false;
    hasSelectedTableTuple.value = false;
    hasSelectedTablePage.value = false;
    // Make sure the render step as the final step.
    hasSelectedTableHeap.value = true;
};

const gotoTablePage = async (value: number) => {
    const result = await window.bustub.sendMessage("/get_table_page_info", {
        "page_id": value
    });
    tablePageInfo.value = result.data;
    hasSelectedTableValue.value = false;
    hasSelectedTableTuple.value = false;
    hasSelectedTablePage.value = true;
};

const gotoTableTuple = async (value: number) => {
    const result = await window.bustub.sendMessage("/get_tuple_info", {
        "table_oid": currentTable.value.table_oid,
        "page_id": tablePageInfo.value.page_id,
        "slot_num": value
    });
    tableTupleInfo.value = result.data;
    hasSelectedTableValue.value = false;
    hasSelectedTableTuple.value = true;

};

const gotoTableValue = async (value: number) => {
    TableValueInfo.value = value;
    hasSelectedTableValue.value = true;
};

</script>

<style scoped>
.table-info-item-item-active2 {
    width: 50%;
    border-left: 1px solid rgb(190, 190, 190);
    border-bottom: 1px solid rgb(190, 190, 190);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    background-color: rgb(117, 249, 253);
    cursor: pointer;
}

.table-info-item-item2 {
    width: 50%;
    border-left: 1px solid rgb(190, 190, 190);
    height: 100%;
    display: flex;
    align-items: center;
    /* justify-content: center; */
    /* padding-left: 10px; */
    font-size: 12px;
}

.table-info-item-item1 {
    width: 50%;
    border-left: 1px solid rgb(190, 190, 190);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
}

.table-info-item1 {
    width: 100%;
    height: 35px;
    display: flex;
    border-bottom: 1px solid rgb(190, 190, 190);
}

.page-header {
    height: 35px;
    width: 100%;
    border-bottom: 1px solid rgb(190, 190, 190);
    background-color: rgb(162, 239, 77);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
}

.page-content {
    width: 100%;

}

.middle-header-tag {
    cursor: pointer;
    font-size: 12px;
}

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
    margin: 40px;
    width: calc(100% - 80px);
    text-align: center;
}

.middle-scroll {
    width: 100%;
    height: calc(100% - 35px - 45px);
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
    background-color: #ccc;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid black;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.header {
    font-weight: bold;
    text-align: center;
    line-height: 35px;
    height: 35px;
    border-bottom: 1px solid black;
}

.container {
    position: relative;
    display: flex;
    height: calc(100vh - 60px);
}

.left {
    margin: 5px;
    width: 37.5%;
    margin-right: 0px;
    border: 1px solid black;
}

.middle {
    width: 37.5%;
    margin: 5px;
    margin-right: 0px;
    border: 1px solid black;
    position: relative;
}

.right {
    width: 25%;
    margin: 5px;
    border: 1px solid black;
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

.right-table-container {
    height: calc(50% - 20px);
    position: relative;
}

.custom-breadcrumb {
    font-size: 16px;
    line-height: 16px;
    margin-left: 3px;
    margin-right: 3px;
}

.table-page-arrow {
    font-size: 30px;
    margin: 20px;
    padding-right: 50%;
    color: rgb(153, 153, 153);
}
</style>