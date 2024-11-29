<template>
    <div class="container">
        <div class="left">
            <div class="header">Catalog</div>
        </div>
        <div class="middle">
            <div class="header">The Currently Selected Table:</div>
            <div class="middle-header"></div>
        </div>

        <div class="right">
            <div class="header" style="background-color:rgb(190,190,190);">Buffer Pool</div>
        </div>
    </div>

</template>

<script setup lang="ts">

</script>

<style scoped>
.middle-header {
    background-color: rgb(190, 190, 190);
    width: 100%;
    height: 40px;
    border-top: 3px solid black;
    border-bottom: 1px solid black;
}

.header {
    font-weight: bold;
    text-align: center;
    line-height: 35px;
    height: 35px;
    border-bottom: 1px solid black;
}

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