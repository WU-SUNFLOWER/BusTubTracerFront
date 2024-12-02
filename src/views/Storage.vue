<template>
    <div class="container">
        <div class="left">
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
                style="width:99%;margin:0.5%;height:calc(50% - 35px - 40px - 25px);" 
                border 
                highlight-current-row
                @current-change="handleCurrentChange"
            >
                <el-table-column prop="table_oid" label="Table ID"></el-table-column>
                <el-table-column prop="table_name" label="Table Name"></el-table-column>
            </el-table>
            <div class="header" style="border-top: 1px solid black;">Table Content</div>
            <div class="right-table-container">
                <h1 v-if="!hasSelectedRow" class="tip-text">Please select a table.</h1>
                <el-table 
                    v-if="hasSelectedRow"
                    :data="currentTable.data"
                    border 
                    stripe
                    style="width:99%;height: 99%;margin:0.5%;"
                >
                    <el-table-column 
                        v-for="header in currentTable.headers" 
                        :key="header" 
                        :prop="header"
                        :label="header">
                    </el-table-column>
                </el-table>
            </div>

        </div>
        <div class="middle">
            <h1 v-if="!hasSelectedRow" class="tip-text">Please select a table.</h1>
            <div v-if="hasSelectedRow" style="height: 100%;">
                <div class="header">The Currently Selected Table: {{ currentRow.table_name }}</div>
                <div class="middle-header"></div>
                <div class="middle-scroll">
                    <div class="table-info" >
                        <div style="font-weight: bold;font-size: 18px;">The Properties of Your Table</div>
                        <div class="table-info-item">
                            <div class="table-info-item-item">table name</div>
                            <div class="table-info-item-item">{{ currentRow.table_name }}</div>
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
        </div>

        <div class="right">
            <div class="header" style="background-color:rgb(190,190,190);">Buffer Pool</div>
            <el-table
                :data="bufferPoolInfo" 
                :row-class-name="getTableRowClassName"
                style="width: 99%;margin: 0.5%;height: calc(100% - 45px);" 
                border
            >
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
import { Search } from '@element-plus/icons-vue'

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
const currentRow = ref({  table_oid: -1, table_name: '', });
const currentTable = ref({ data: [], headers: [] });
const handleCurrentChange = async (val: TableInfo) => {
    if (val) hasSelectedRow.value = true;
    currentRow.value = val;
    
    let result = await window.bustub.sendMessage("/query_table_by_name", {
        'table_name': val?.table_name
    });
    currentTable.value = queryResultToElTableData(result);
};

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

const getTableRowClassName = ({ row } : { row: any }) => {
    return row.is_free ? "row-green" : "row-common";
};

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
    height:calc(50% - 20px);
    position: relative;
}
</style>