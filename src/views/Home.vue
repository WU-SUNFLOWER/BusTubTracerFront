<template>
    <div class="search-remain" :style="{ width: `calc(100% - ${sidebarWidth}px)` }">
        <div class="search-box">
            <el-input class="search-input" v-model="searchInput" @input="handleInputChange" @keyup.enter="handleSearch"
                placeholder="Enter your SQL command here" clearable spellcheck="false">
                <template #append>
                    <el-button style="height: 50px;" class="custom-primary-button"
                        @click="handleSearch">Submit</el-button>
                </template>
            </el-input>
        </div>
        <el-scrollbar ref="scrollbarRef">
            <div class="description" ref="descriptionRef">
                <h2>🌟Welcome to BusTubTracer!</h2>
                <p>You can submit your SQL command here.</p>
                <h2>🌰Some Examples:</h2>
                <ul>
                    <li>Query all teachers' names.</li>
                    <p class="text-copy" @click="copyToSearchInput('select name from teacher;')">select name from
                        teacher;
                    </p>
                    <li>Query all courses with more than 2 credits.</li>
                    <p class="text-copy" @click="copyToSearchInput('select * from course where credit > 2;')">select *
                        from
                        course where
                        credit > 2;</p>
                    <li>Query the names of the teachers and the courses they teach.</li>
                    <p class="text-copy"
                        @click="copyToSearchInput('select course.name,teacher.name from course, teacher, course_teacher where course.id =  course_teacher.cid and teacher.id = course_teacher.tid;')">
                        select course.name,
                        teacher.name from course, teacher, course_teacher where
                        course.id =
                        course_teacher.cid and teacher.id = course_teacher.tid;</p>
                </ul>
            </div>
            <div v-for="(item, index) in interleavedItems" :key="index">
                <div v-if="index % 2 == 0" class="search-remain1">
                    <div class="tag">🚀 Your SQL</div>
                    <div class="sql-result-area2"> {{ item }} </div>
                    <el-icon class="copy" @click="copyToClipboard(item)">
                        <CopyDocument />
                    </el-icon>
                </div>
                <div v-if="index % 2 == 1" class="search-remain2">
                    <div class="tag">💡 BusTub Reply</div>
                    <div class="sql-result">
                        <div :class="`sql-result-area ${item.is_successed ? '' : 'error_msg'}`">
                            {{ item.text }}
                        </div>
                    </div>
                    <el-icon class="copy" @click="copyToClipboard(item.text)">
                        <CopyDocument />
                    </el-icon>
                </div>
            </div>
            <div class="search-remain-padding"></div>
            <el-button type="danger" class="clear-screen-button" @click="clearScreen">Clear Screen</el-button>
        </el-scrollbar>
    </div>
    <Sidebar ref="sidebarRef" @updateSidebarWidth="updateSidebarWidth" />

</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
    getCurSearchCommand, setSearchHistory, getSearchHistory,
    setCurSearchCommand, getSearchResult, setSearchResult,
} from '@/utils/localStorage';
import { ElMessage } from 'element-plus';
import { useLinkStore } from '@/stores/linkStore';
import { useProcessDataStore } from '@/stores/processDataStore';
import { CopyDocument } from '@element-plus/icons-vue'
import Sidebar from '@/components/Sidebar.vue';

const sidebarWidth = ref(0);
const scrollbarRef = ref<HTMLElement | null>(null);

const updateSidebarWidth = (value: number) => {
    sidebarWidth.value = value;
};

const linkStore = useLinkStore();
const processStore = useProcessDataStore();

const searchInput = ref('');
const rawSqlResult = ref('');
const searchRemain1 = ref<any>([]);
const searchRemain2 = ref<any>([]);

const interleavedItems = computed(() => {
    const maxLength = Math.max(searchRemain1.value.length, searchRemain2.value.length);
    const result = [];
    for (let i = 0; i < maxLength; i++) {
        if (i < searchRemain1.value.length) {
            result.push(searchRemain1.value[i]);
        }
        if (i < searchRemain2.value.length) {
            result.push(searchRemain2.value[i]);
        }
    }
    return result;
});

onMounted(() => {
    searchInput.value = getCurSearchCommand();
});

const scrollToBottom = () => {
    if (scrollbarRef.value) {
        const scrollbarObject: any = scrollbarRef.value;
        const container = scrollbarObject.$el.querySelector('.el-scrollbar__wrap');
        container.style.scrollBehavior = 'smooth';
        container.scrollTop = container.scrollHeight;
    }
};

const handleSearch = async () => {
    const inputSQL = searchInput.value;
    if (inputSQL === '') {
        ElMessage({
            message: 'Search input cannot be empty',
            type: 'warning',
        });
        return;
    }
    searchRemain1.value.push(inputSQL);
    const result = await window.bustub.sendMessage("/submit_sql_command", {
        'sql': inputSQL
    });
    setCurSearchCommand(inputSQL);
    saveSearchToLocalStorage(inputSQL, result);
    if (result['err_msg']) {
        ElMessage({
            message: result['err_msg'],
            type: 'error'
        });
        searchRemain2.value.push({
            text: "Error: " + result['err_msg'],
            is_successed: false,
        });
        return;
    }
    ElMessage({
        message: 'Success',
        type: 'success',
    });
    const {
        raw_result: rawResult,
        can_show_process: canShowProcess,
        process_info: processInfo,
    } = result['data'];


    rawSqlResult.value = rawResult;
    searchRemain2.value.push({
        text: rawSqlResult.value,
        is_successed: true,
    });

    if (canShowProcess) {
        linkStore.enableLink("Process");
        processStore.setData(processInfo);
    }

    if (sidebarRef.value && !inputSQL.startsWith("select ")) {
        await sidebarRef.value.reloadAllData();
    }

    // We should wait Vue3 to render new elements to screen.
    // Then we can get the right `scrollHeight`,
    // and scroll the scroll bar to the bottom of the view area.
    requestAnimationFrame(() => scrollToBottom());
};

const handleInputChange = () => {
    setCurSearchCommand(searchInput.value);
};

const saveSearchToLocalStorage = (searchSQL: string, searchResult: any) => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}/${padZero(currentTime.getMonth() + 1)}/${padZero(currentTime.getDate())} ${padZero(currentTime.getHours())}:${padZero(currentTime.getMinutes())}`;
    const currentSearchHistory = {
        time: formattedTime,
        sql: searchSQL,
    };

    let searchHistories = getSearchHistory() ?? [];
    searchHistories.push(currentSearchHistory);
    setSearchHistory(searchHistories);

    let searchResults = getSearchResult() ?? [];
    searchResults.push(searchResult);
    setSearchResult(searchResults);
};

function padZero(number: number): string {
    return number.toString().padStart(2, '0');
}

const copyToSearchInput = (text: string) => {
    searchInput.value = text;
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        ElMessage({
            message: 'Copied to clipboard',
            type: 'success',
        });
    } catch (err) {
        ElMessage({
            message: 'Error copying to clipboard',
            type: 'error',
        });
    }
}

const descriptionRef = ref<HTMLElement | null>(null);
const clearScreen = () => {

    const tip = 'Are you sure you want to clear the screen?\nYou can still access all the records on the "SQL Logs" page.';
    if (!window.confirm(tip)) {
        return;
    }

    if (descriptionRef.value) {
        descriptionRef.value.remove();
        descriptionRef.value = null;
    }
    searchRemain1.value = [];
    searchRemain2.value = [];
    ElMessage({
        message: 'Screen cleared',
        type: 'success',
    });
};
const sidebarRef = ref();

</script>

<style scoped>
.clear-screen-button {
    position: fixed;
    bottom: 80px;
    left: 20px;
    z-index: 1000;
}

.copy {
    margin-left: 20px;
    cursor: pointer;
    color: gray;
}

.tag {
    min-width: 9%;
    white-space: nowrap;
    margin-left: 2%;
    margin-right: 2%;
    height: 14px;
    font-size: 12px;
    text-align: center;
    padding: 10px;
    background-color: white;
    border: 1px solid #ccc;
}

.search-remain1 {
    width: calc(100% - 40px);
    display: flex;
    background-color: rgb(239, 239, 239);
    padding: 20px;
}

.search-remain2 {
    width: calc(100% - 40px);
    display: flex;
    padding: 20px;
}

.search-remain {
    height: calc(100vh - 52px);
    overflow: hidden;
    text-align: left;
    position: relative;
}

.search-box {
    position: absolute;
    bottom: 0%;
    left: 9%;
    width: 82.5%;
    box-sizing: border-box;
    padding: 70px;
    z-index: 1000;
}

.search-input {
    height: 50px;
    font-size: 16px;
    box-shadow: 0 0 #0000, 0 0 #0000, 0 0 15px #0000001a;
}

.text-copy {
    padding: 5px;
    border: 1px solid #ccc;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, .3);
    cursor: pointer;
    font-family: monospace;
}

.custom-primary-button {
    background-color: rgb(64, 149, 229) !important;
    color: white !important;
    border-radius: 0 5px 5px 0;
}

.container {
    margin: 0px 120px;
    text-align: center;
    margin-left: 10%;
    margin-right: 10%;
    margin-top: 40px;
    font-family: Arial, sans-serif;
}


.description {
    font-size: 16px;
    line-height: 1.8;
    text-align: left;
    margin-top: 40px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 40px;
    width: 65%;
}

.description ul {
    list-style-type: disc;
    padding-left: 20px;
    margin-top: 10px;
}

.description li {
    margin-bottom: 5px;

}

.sql-result {
    width: calc(100% - 20%);
}

.sql-result .sql-result-area {
    white-space: pre;
    font-family: monospace;
    text-align: center;
    font-size: 16px;
}

.error_msg {
    color: rgb(255, 0, 0);
}

.sql-result-area2 {
    white-space: pre;
    width: 80%;
    font-family: monospace;
    word-wrap: break-word;
    white-space: normal;
    font-size: 16px;
}

.search-remain-padding {
    height: 200px;
}
</style>