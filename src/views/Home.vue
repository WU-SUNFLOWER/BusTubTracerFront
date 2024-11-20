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
import { ref } from 'vue';
const searchInput = ref('');

const handleSearch = () => {
    console.log('Searching for:', searchInput.value);
};
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

.title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
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