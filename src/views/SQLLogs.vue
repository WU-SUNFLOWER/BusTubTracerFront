<template>
    <div class="container">
        <el-table :data="tableData" :style="{
            'width': '100vw'
        }" :row-style="{
            'height': '60px'
        }" :header-cell-style="{
            'background-color': 'lightgray',
            'color': 'black',
            'font-weight': '800',
            'font-size': '16px',
            'text-align': 'center',
            'height': '60px'
        }" border class="table">
            <el-table-column prop="time" label="Time" align="center" width="150" :resizable="false" />
            <el-table-column prop="command" label="Your SQL Command" align="center" :resizable="false" />
            <el-table-column prop="result" label="Result" align="center" width="150" :resizable="false" />
            <el-table-column label="Options" align="center" width="250" :resizable="false">
                <template v-slot="scope">
                    <div style="display: flex; justify-content: center;">
                        <el-tooltip :content="scope.row.result === 'Failed' ?
                            'You can\'t check failed record.'
                            : 'This record is not supported for checking.'
                            " placement="bottom" v-if="!scope.row.canShowProcess">
                            <el-button type="primary" disabled style="font-size: 12px;width: 30%;">Process</el-button>
                        </el-tooltip>
                        <el-button type="primary" style="font-size: 12px;width: 30%;"
                            @click="checkProcess(scope.$index, scope.row)" v-else>
                            Process</el-button>
                        <el-tooltip :content="scope.row.result === 'Failed' ?
                            'You can\'t check failed record.'
                            : 'This record is not supported for checking.'
                            " placement="bottom" v-if="!scope.row.canShowProcess">
                            <el-button type="primary" disabled style="font-size: 12px;width: 30%;">Result</el-button>
                        </el-tooltip>
                        <el-button type="primary" style="font-size: 12px;width: 30%;"
                            @click="checkResult(scope.$index, scope.row)" v-else>
                            Result</el-button>
                        <el-button type="danger" style="font-size: 12px;width: 30%;"
                            @click="deleteRow(scope.$index)">Delete</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-button type="danger" size="large" class="clear-all-button" @click="clearAllRecords">Clear All
            Records</el-button>
    </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import { getSearchHistory, getSearchResult, setSearchHistory, setSearchResult, setCurSearchCommand } from '@/utils/localStorage';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useProcessDataStore } from '@/stores/processDataStore';
import { useLinkStore } from '@/stores/linkStore';
import { useRouter } from 'vue-router';

const tableData = ref();
const searchHistory = ref([]);
const searchResults = ref([]);
const router = useRouter();
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
            rawResult: rawResult,
            canShowProcess: rawResult?.data?.process_info !== void 0,
        };
    });
};

const processStore = useProcessDataStore();
const linkStore = useLinkStore();
const checkProcess = async (index: number, row: any) => {
    const rawResult = row?.rawResult;
    const processInfo = rawResult?.data?.process_info;
    if (!processInfo) {
        console.error("can't find raw result");
        return;
    }
    linkStore.enableLink("Process");
    processStore.setData(processInfo);

    router.push({ path: '/process' });
};

const checkResult = async (index: number, row: any) => {
    const rawResult = row?.rawResult;
    const result = rawResult?.data?.raw_result || 'No result'
    const scrollableDiv = h('div', {
        style: {
            height: '300px',
            width: '400px',
            overflow: 'auto',
            whiteSpace: 'pre',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontSize: '16px'
        }
    }, [result]);

    ElMessageBox({
        title: 'SQL Result',
        message: scrollableDiv,
        showClose: false
    });
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