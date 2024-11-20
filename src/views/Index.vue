<template>
    <div class="container">
        <div class="left"></div>
        <div class="middle"></div>
        <div class="right"></div>
    </div>

</template>

<script setup lang="ts">

</script>

<style scoped>
.container {
    display: flex;
    height: calc(100vh - 60px);
}

.left {
    margin: 5px;
    width: 25%;
    margin-right: 0px;
    border: 1px solid black;

}

.middle {
    width: 37.5%;
    margin: 5px;
    margin-right: 0px;
    border: 1px solid black;
}

.right {
    width: 37.5%;
    margin: 5px;
    border: 1px solid black;
}
</style>