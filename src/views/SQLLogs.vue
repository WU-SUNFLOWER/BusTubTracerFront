<template>
    <div class="container">
        <el-scrollbar>
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
            </el-table>        
        </el-scrollbar>        
    </div>
</template>

<script setup lang="ts">
import { getSearchHistory, getSearchResult } from '@/utils/localStorage';

const getTableData = () => {
    const searchResults = getSearchResult();
    return getSearchHistory().map((item: any, index: number) => {
        let rawResult = searchResults[index];
        let outputResult = 'No result';
        if (rawResult?.err_msg) {
            outputResult = 'Failed';
        } 
        else if (rawResult?.data) {
            outputResult = 'Successful';
        }
        return {
            time: item.time,
            command: item.sql,
            result: outputResult,
        };
    });
};

const tableData = getTableData().reverse();

</script>

<style scoped>
.container {
    height: calc(100vh - 60px);
    width: 100%;
}

.table {
    margin-top: -1px;
}
</style>