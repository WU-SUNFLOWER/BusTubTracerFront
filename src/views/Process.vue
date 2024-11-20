<template>
    <div class="container">
        <div class="left">
            <div class="tip">
                The executive process of your sql command.
            </div>
            <button v-for="(btnText, index) in buttonTexts" :key="index"
                :class="['btn-tree', { 'btn-selected': selectedBtnIndex === index }]" @click="selectButton(index)">
                {{ btnText }}
            </button>
        </div>
        <div class="middle_planner" v-show="selectedBtnIndex == 0"></div>
        <div class="right_planner" v-show="selectedBtnIndex == 0"></div>
        <div class="middle_planner" v-show="selectedBtnIndex == 1"></div>
        <div class="right_planner" v-show="selectedBtnIndex == 1"></div>
        <div class="middle_executor" v-show="selectedBtnIndex == 2"></div>
        <div class="right_executor" v-show="selectedBtnIndex == 2"></div>
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';

const buttonTexts = ['Planner Tree', 'Optimized Planner Tree', 'Executor Tree'];
const selectedBtnIndex = ref(0);
function selectButton(index: number) {
    selectedBtnIndex.value = index;
}
</script>

<style scoped>
.middle_executor {
    width: 40%;
    border-right: 1px solid #ccc;
}

.right_executor {
    width: 40%;
}

.btn-tree {
    width: 85%;
    margin: 10px auto;
    font-size: 16px;
    height: 50px;
    background-color: white;
    border: 1px solid #ccc;
    box-shadow: 0px 2px 3px #ccc;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-tree:hover {
    background-color: #f0f0f0;
}

.btn-selected {
    background-color: blue;
    color: white;
}

.tip {
    padding: 30px;
    font-size: 15px;
    font-weight: bold;
}

.container {
    display: flex;
    height: calc(100vh - 60px);
}

.left {
    width: 20%;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;

}

.middle_planner {
    width: 50%;
    border-right: 1px solid #ccc;
}

.right_planner {
    width: 30%;

}
</style>