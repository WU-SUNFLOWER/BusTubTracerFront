<template>
    <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
        <div class="resizer" @mousedown="startDragging">
            <svg width="5" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" class="resizer-icon">
                <path fill="#BFC3CD"
                    d="M0 0h2v2H0zM0 3h2v2H0zM0 6h2v2H0zM0 9h2v2H0zM0 12h2v2H0zM0 15h2v2H0zM0 18h2v2H0zM0 21h2v2H0zM0 24h2v2H0zM3 0h2v2H3zM3 3h2v2H3zM3 6h2v2H3zM3 9h2v2H3zM3 12h2v2H3zM3 15h2v2H3zM3 18h2v2H3zM3 21h2v2H3zM3 24h2v2H3z">

                </path>
            </svg>
        </div>
        <div class="sidebar-content">
            <div class="left">
                <div class="header">Catalog</div>
                <el-input v-model="searchInput" clearable style="width: 99%;margin:0.5%;"
                    placeholder="Search your table quickly" :prefix-icon="Search">
                </el-input>
                <el-scrollbar style="width:99%;margin:0.5%;height:calc(50% - 35px - 40px - 25px);">
                    <el-table-v2 :data="filteredTables" :columns="columns1" :width="600" :height="300" border
                        highlight-current-row @click="handleRowClick" ref="tableListRef">
                    </el-table-v2>
                </el-scrollbar>

                <div class="header" style="border-top: 1px solid black;">Table Content</div>
                <div class="right-table-container">
                    <h1 v-if="!hasSelectedRow" class="tip-text">Please select a table.</h1>
                    <el-scrollbar style="margin:0.5%;">
                        <el-table-v2 :width="600" :height="300" v-if="hasSelectedRow" v-loading="loadingTableContent"
                            border stripe style="width:99%;height: 99%;margin:0.5%;" :columns="currentTableColumns"
                            :data="currentTableData">
                        </el-table-v2>
                    </el-scrollbar>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, defineExpose } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { queryResultToElTableData } from '@/utils/bustub';
import type { Column, } from 'element-plus';

const sidebarWidth = ref(350); // 初始宽度
let isDragging = false;
let startX: number | null = null;
let initialWidth: number | null = null;
let isResizing = false;

const tableListRef = ref();
const loadingTableContent = ref(false);

const emit = defineEmits(['updateSidebarWidth']);

watch(sidebarWidth, (newValue) => {
    emit('updateSidebarWidth', newValue);
});

const startDragging = (event: MouseEvent) => {
    isDragging = true;
    startX = event.clientX;
    initialWidth = sidebarWidth.value;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX!;
    let newWidth = initialWidth! - deltaX;
    const minWidth = 15;
    const maxWidth = window.innerWidth / 2;
    if (deltaX > 0) {
        newWidth = newWidth < 50 ? minWidth : newWidth;
    }
    sidebarWidth.value = Math.min(newWidth, maxWidth);
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

const reloadAllData = async () => {
    let result = await window.bustub.sendMessage("/get_all_tables", {});
    let allTableInfo = result.data;
    tablesInfo.value = loadAllTables(allTableInfo);
    if (hasSelectedRow.value === true && currentRow.value.table_name) {
        for (let table of tablesInfo.value) {
            if (
                table.table_name === currentRow.value.table_name
                && table.table_oid === currentRow.value.table_oid
            ) {
                // This line will call updateTableContentViewer finally.
                // So we should not call updateTableContentViewer by ourselves!
                tableListRef.value.setCurrentRow(table);
                break;
            }
        }
    }
};

onMounted(async () => {
    emit('updateSidebarWidth', sidebarWidth.value);
    await reloadAllData();
});

onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mousemove', onResizeMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
});

defineExpose({ reloadAllData });

interface TableInfo {
    table_oid: number;
    table_name: string;
    id: number,
    parentId: number | null,
}
const searchInput = ref('');
const tablesInfo = ref<TableInfo[]>([]);
const columns1: Column<any>[] = [{
    key: 'table_oid',
    dataKey: 'table_oid',
    title: 'Table ID',
    width: 50
}, {
    key: 'table_name',
    dataKey: 'table_name',
    title: 'Table Name',
    width: 150
},]

const currentTableColumns = computed(() => {
    return currentTable.value.headers.map(header => ({
        key: header,
        dataKey: header,
        title: header,
        width: 100
    })) as Column<any>[];
});
const currentTableData = computed(() => {
    return currentTable.value.data;
});

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
        id: table.table_oid,
        parentId: null,
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

const updateTableContentViewer = async () => {
    loadingTableContent.value = true;
    const val = currentRow.value;
    let result = await window.bustub.sendMessage("/query_table_by_name", {
        'table_name': val?.table_name
    });
    const res = queryResultToElTableData(result);
    currentTable.value.headers = res.headers;
    currentTable.value.data = res.data;
    let currentId = 1;
    currentTable.value.data.forEach((item: any) => {
        if (!item.id) {
            item.id = currentId++;
        }
        if (!item.parentId) {
            item.parentId = null;
        }
        if (item.rid !== undefined) {
            delete item.rid;
        }
    });
    currentTable.value.table_name = result.data.table_name;
    currentTable.value.table_oid = result.data.table_oid;
    loadingTableContent.value = false;
}


const handleRowClick = async (e: any) => {
    const target = e.target
    let row = target.parentNode
    while (1) {
        const nowClassArr = row.className?.split(' ') || []
        if (nowClassArr.indexOf('el-table-v2__row') > -1) break
        if (nowClassArr.indexOf('el-table-v2__header') > -1 || nowClassArr.indexOf('el-virtual-scrollbar') > -1 || nowClassArr.indexOf('el-table-v2__empty') > -1) {
            return
        }
        const parentNode = row.parentNode
        if (!parentNode) {
            return
        }
        row = parentNode
    }
    hasSelectedRow.value = true;
    currentRow.value.table_oid = row.getAttribute('rowkey');
    const foundTable = tablesInfo.value.find(table => table.table_oid == currentRow.value.table_oid);
    currentRow.value.table_name = (foundTable?.table_name || '');
    await updateTableContentViewer();

};
</script>

<style scoped>
.tip-text {
    margin: 0px;
    text-align: center;
    width: 100%;
}

.right-table-container {
    height: calc(50% - 35px);
    position: relative;
}

.left {
    height: calc(100vh - 52px - 40px - 2px);
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
    height: calc(-3px + 100vh);
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
    width: 15px;
    cursor: col-resize;
    user-select: none;
    display: flex;
    align-items: center;
    background: #e9ecf1;
}

.resizer-icon {
    position: absolute;
    left: 0;
    margin-left: 4px;
}
</style>
