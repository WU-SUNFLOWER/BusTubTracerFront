<template>
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
</template>

<script setup lang="ts">
import { getSearchHistory, getSearchResult } from '@/utils/localStorage';
function getTableData() {
    return getSearchHistory().map((item: any) => {
        const command = item.value;
        const result = getSearchResult()[item.Index] || 'No result'; // 如果没有对应的搜索结果，则显示 'No result'
        return {
            time: item.time,
            command: command,
            result: result
        };
    });
}

const tableData = getTableData().reverse();

</script>

<style scoped>
.table {
    margin-top: -1px;
}
</style>