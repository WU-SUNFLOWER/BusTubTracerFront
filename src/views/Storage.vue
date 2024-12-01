<template>
    <div class="container">
        <div class="left">
            <div class="header">Catalog</div>
            <el-autocomplete :fetch-suggestions="querySearch" v-model="searchInput" @keyup.enter="handleSearch"
                clearable style="width: 99%;margin:0.5%;">
                <template #append>
                    <el-button class="custom-primary-button" @click="handleSearch">Search</el-button>
                </template>
            </el-autocomplete>
            <el-scrollbar style="width: 100%;
                height: calc(100% - 35px - 40px - 25px);">
                <el-table :data="filteredTables" style="width: 99%;margin: 0.5%;" border highlight-current-row
                    @current-change="handleCurrentChange">
                    <el-table-column prop="table_oid" label="Table ID"></el-table-column>
                    <el-table-column prop="value" label="Table Name"></el-table-column>
                </el-table>
            </el-scrollbar>
            <div class="footer" style="height: 25px;width: 100%;">
                <el-button class="footer-btn" :disabled="!hasSelectedRow" @click="showTableContent">show
                    content</el-button>
                <el-button class="footer-btn" :disabled="!hasSelectedRow" @click="showTableIndices">show
                    indices</el-button>

            </div>
        </div>
        <div class="middle">
            <div class="header">The Currently Selected Table:</div>
            <div class="middle-header"></div>
            <div class="middle-scroll">
                <div class="table-info" v-if="hasSelectedRow">
                    <div style="font-weight: bold;font-size: 18px;">The Properties of Your Table</div>
                    <div class="table-info-item">
                        <div class="table-info-item-item">table name</div>
                        <div class="table-info-item-item">{{ currentRow.value }}</div>
                    </div>
                    <div class="table-info-item">
                        <div class="table-info-item-item">table id</div>
                        <div class="table-info-item-item">{{ currentRow.table_oid }}</div>
                    </div>
                    <div class="table-info-item">
                        <div class="table-info-item-item">table head</div>
                        <div class="table-info-item-item-active">...</div>
                    </div>
                </div>

            </div>

        </div>

        <div class="right">
            <div class="header" style="background-color:rgb(190,190,190);">Buffer Pool</div>
            <el-scrollbar style="width: 100%;
                 height: calc(100% - 35px);">
                <el-table :data="bufferPoolInfo.data.buffer_pool_info" style="width: 98%;margin: 1%;" border
                    highlight-current-row>
                    <el-table-column prop="frame_id" label="frame id"></el-table-column>
                    <el-table-column prop="page_id" label="page id"></el-table-column>
                    <el-table-column prop="is_dirty" label="is dirty"></el-table-column>
                    <el-table-column prop="pin_count" label="pin count"></el-table-column>
                    <el-table-column prop="is_free" label="is free"></el-table-column>
                </el-table>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import allTableData from '../../api/get_all_tables.json';
import bufferPoolData from '../../api/get_buffer_pool_info.json';
import tableData from '../../api/query_table_by_name.json';


const allTableInfo = allTableData as any;
const bufferPoolInfo = bufferPoolData as any;

interface TableInfo {
    table_oid: number;
    value: string;
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

const querySearch = (queryString: string, cb: any) => {
    const results = queryString
        ? tablesInfo.value.filter(createFilter(queryString))
        : tablesInfo.value;
    cb(results);
};

const createFilter = (queryString: string) => {
    return (tableInfo: TableInfo) => {
        const searchValue = tableInfo.value.toLowerCase();
        const searchOid = tableInfo.table_oid.toString().toLowerCase();
        const query = queryString.toLowerCase();
        return searchValue.includes(query) || searchOid.includes(query);
    };
};

const loadAllTables = () => {
    return allTableInfo.data.tables.map((table: any) => ({
        value: table.table_name,
        table_oid: table.table_oid,
    }));
};

onMounted(() => {
    tablesInfo.value = loadAllTables();
});

const handleSearch = () => {
};

const hasSelectedRow = ref(false)
const currentRow = ref()
const handleCurrentChange = (val: TableInfo | undefined) => {
    if (val) hasSelectedRow.value = true
    currentRow.value = val
}

const tableInfo = tableData as any

const showTableContent = () => {
    console.log(tableInfo)
}
const showTableIndices = () => {
}

/*{
    "data": {
        "table_oid": 1,
        "table_name": "student",
        "column_names": [
            "id",
            "name",
            "sex",
            "age",
            "score"
        ],
        "tuples": [
            {
                "rid": {
                    "page_id": 1,
                    "slot_num": 16
                },
                "columns": [
                    1,
                    "xy",
                    0,
                    1,
                    100
                ]
            }
        ],
        "indices": [
            {
                "index_oid": 1,
                "index_name": "student_score_index",
                "key_schema": "(score(INT, 4))",
                "key_size": 4
            }
        ]
    }
} */

</script>

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
}

.container {
    position: relative;
    display: flex;
    height: calc(100vh - 60px);
}

.left {
    margin: 5px;
    width: 25%;
    margin-right: 0px;
    border: 1px solid black;
}

.middle {
    width: 37.5%;
    margin: 5px;
    margin-right: 0px;
    border: 1px solid black;
}

.right {
    width: 37.5%;
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
</style>