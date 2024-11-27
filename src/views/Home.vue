<template>
    <div class="container">
        <h1>Welcome to BusTubTracer</h1>
        <div class="description">
            <h3>Explore how SQL command executed:</h3>
            <ul>
                <li>Input a sql command to check executive process of it.</li>
            </ul>
            <h3>Explore how data stored in DBMS:</h3>
            <ul>
                <li>Click "Storage" button to check how tables are organized by memory pages.</li>
                <li>Click "Index" button to check how table Indices are organized by B+ tree.</li>
            </ul>
            <h3>Need more tips:</h3>
            <ul>
                <li>Click "Help" button to get more tips.</li>
            </ul>
        </div>
        <div class="search-box">
            <el-input v-model="searchInput" @keyup.enter="handleSearch" placeholder="Enter your SQL command here"
                clearable>
                <template #append>
                    <el-button class="custom-primary-button" @click="handleSearch">Submit</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCurSearchCommand, setSearchHistory, getSearchHistory, setCurSearchCommand } from '@/utils/localStorage';

const searchInput = ref('');

onMounted(() => {
    searchInput.value = getCurSearchCommand();
});

const handleSearch = () => {
    saveSearchToLocalStorage(searchInput.value);
    setCurSearchCommand(searchInput.value);
};
const saveSearchToLocalStorage = (searchValue: string) => {
    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}/${padZero(currentTime.getMonth() + 1)}/${padZero(currentTime.getDate())} ${padZero(currentTime.getHours())}:${padZero(currentTime.getMinutes())}`;
    const searchData = { time: formattedTime, value: searchValue };

    let searchHistory = getSearchHistory() || [];
    searchHistory.push(searchData);
    setSearchHistory(searchHistory);
};
function padZero(number: number): string {
    return number.toString().padStart(2, '0');
}
</script>

<style scoped>
.custom-primary-button {
    background-color: rgb(64, 149, 229) !important;
    color: white !important;
    border-radius: 0 5px 5px 0;
}

.container {
    margin: 0px 120px;
    text-align: center;
    padding: 30px;
    font-family: Arial, sans-serif;
}


.description {
    font-size: 16px;
    line-height: 1.8;
    text-align: left;
    margin-bottom: 30px;

}

.description ul {
    list-style-type: disc;
    padding-left: 20px;
    margin-top: 10px;
}

.description li {
    margin-bottom: 5px;

}
</style>