<template>
    <el-scrollbar class="sidebar" :style="{ width: sidebarWidth + 'px' }" @mousedown="startDragging">
        <div class="resizer" @mousedown.prevent="startResizing"></div>
        <div class="sidebar-content">
            <div class="left">
                <div class="header">Catalog</div>
                <el-input v-model="searchInput" clearable style="width: 99%;margin:0.5%;"
                    placeholder="Search your table quickly" :prefix-icon="Search">
                </el-input>
                <el-table :data="filteredTables" style="width:99%;margin:0.5%;height:calc(50% - 35px - 40px - 25px);"
                    border highlight-current-row @current-change="handleCurrentChange">
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
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { queryResultToElTableData } from '@/utils/bustub';

const sidebarWidth = ref(200); // 初始宽度
let isDragging = false;
let startX: number | null = null;
let initialWidth: number | null = null;
let isResizing = false;

const startDragging = (event: MouseEvent) => {
    isDragging = true;
    startX = event.clientX;
    initialWidth = sidebarWidth.value;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

const startResizing = (event: MouseEvent) => {
    isResizing = true;
    isDragging = false; // 防止同时触发拖拽和调整宽度
    initialWidth = sidebarWidth.value;
    document.addEventListener('mousemove', onResizeMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX!;
    const newWidth = initialWidth! - deltaX;
    const minWidth = 5;
    sidebarWidth.value = Math.max(minWidth, newWidth);
};

const onResizeMouseMove = (event: MouseEvent) => {
    if (!isResizing) return;
    const deltaX = event.clientX - startX!;
    const minWidth = 5;
    sidebarWidth.value = Math.max(minWidth, initialWidth! + deltaX);
};

const onMouseUp = () => {
    if (!isDragging && !isResizing) return;
    isDragging = false;
    isResizing = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousemove', onResizeMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
};

onMounted(() => {
});

onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousemove', onResizeMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
});

///

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
    if (!val) return
    hasSelectedRow.value = true;
    currentRow.value = val;

    let result = await window.bustub.sendMessage("/query_table_by_name", {
        'table_name': val?.table_name
    });
    const res = queryResultToElTableData(result);
    currentTable.value.headers = res.headers;
    currentTable.value.data = res.data;
    currentTable.value.table_name = result.data.table_name;
    currentTable.value.table_oid = result.data.table_oid;

};
</script>

<style scoped>
.tip-text {
    margin: 0px;
    text-align: center;
    width: 100%;
}

.right-table-container {
    height: calc(50% - 20px);
    position: relative;
}

.left {
    margin: 5px;
    /* width: 37.5%; */
    margin-right: 0px;
    border: 1px solid black;
}

.header {
    font-weight: bold;
    text-align: center;
    line-height: 35px;
    height: 35px;
    border-bottom: 1px solid black;
}

.sidebar {
    position: fixed;
    top: 52px;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
    max-width: calc(100% - 5px);
    background-color: white;
    border-left: 1px solid #ccc;
    overflow: auto;

}

.sidebar-content {
    padding: 20px;
}

.resizer {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 5px;
    cursor: ew-resize;
    user-select: none;
    background-color: #ccc;
}
</style>