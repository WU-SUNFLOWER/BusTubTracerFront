<template>
    <div class="container">
        <el-table :data="tableData" :row-style="{ 'height': '60px', }" :header-cell-style="{
            'background-color': 'lightgray',
            'color': 'black',
            'font-weight': '800',
            'font-size': '16px',
            'text-align': 'center',
            'height': '60px'
        }" border class="table">
            <el-table-column prop="time" label="Time" align="center" />
            <el-table-column prop="command" label="Your SQL Command" align="center" />
            <el-table-column prop="result" label="Result" align="center" />
            <el-table-column label="Options" align="center" width="180">
                <template v-slot="scope">
                    <div style="display: flex; justify-content: center;">
                        <el-button type="primary" @click="check(scope.$index, scope.row)">Check</el-button>
                        <el-button type="danger" @click="deleteRow(scope.$index)">Delete</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="danger" size="large" class="clear-all-button" @click="clearAllRecords">Clear All
            Records</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getSearchHistory, getSearchResult, setSearchHistory, setSearchResult, setCurSearchCommand } from '@/utils/localStorage';
import { ElMessage } from 'element-plus';
import { useProcessDataStore } from '@/stores/processDataStore';
import { useLinkStore } from '@/stores/linkStore';

const tableData = ref();
const searchHistory = ref([]);
const searchResults = ref([]);

const loadData = () => {
    searchHistory.value = getSearchHistory();
    searchResults.value = getSearchResult();
    tableData.value = searchHistory.value.map((item: any, index) => {
        let outputResult = 'No result';
        let rawResult: any;
        rawResult = searchResults.value[index];
        if (rawResult?.err_msg) {
            outputResult = 'Failed';
        } else if (rawResult?.data) {
            outputResult = 'Successful';
        }
        return {
            time: item.time,
            command: item.sql,
            result: outputResult,
        };
    });
    console.log(tableData.value);
};

const processStore = useProcessDataStore();
const linkStore = useLinkStore();
const check = async (index: number, row: any) => {
    const result = await window.bustub.sendMessage("/submit_sql_command", {
        'sql': row.command
    });
    console.log(result);
    setCurSearchCommand(row.command)
    const {
        raw_result: rawResult,
        can_show_process: canShowProcess,
        process_info: processInfo,
    } = result['data'];
    if (canShowProcess) {
        linkStore.enableLink("Process");
        processStore.setData(processInfo);
        ElMessage({
            message: 'Check the process page to see the result.',
            type: 'success',
        });
    }
};

const deleteRow = (index: number) => {
    tableData.value.splice(index, 1);
    searchHistory.value.splice(index, 1);
    searchResults.value.splice(index, 1);
    setSearchHistory(searchHistory.value);
    setSearchResult(searchResults.value);
    ElMessage({
        message: 'Record deleted successfully!',
        type: 'success',
    });
};

const clearAllRecords = () => {
    if (window.confirm('Are you sure you want to delete all records?')) {
        tableData.value = [];
        searchHistory.value = [];
        searchResults.value = []
        setSearchHistory(searchHistory.value);
        setSearchResult(searchResults.value);
        ElMessage({
            message: 'All records deleted successfully!',
            type: 'success',
        });
    }
};

loadData();
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    width: 100%;
    justify-content: space-between;
}

.table {
    margin-top: -1px;
    flex-grow: 1;
    overflow-y: auto;
}

.clear-all-button {
    position: fixed;
    bottom: 70px;
    left: 20px;
    z-index: 1000;
}
</style>