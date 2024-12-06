<template>
  <div class="container">
    <div class="header">
      <div class="header-nav">
        <router-link v-for="link in linkStore.links" :to="link.to" class="nav-item"
          :class="{ disabled: !link.enabled }">
          {{ link.label }}
        </router-link>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useLinkStore } from '@/stores/linkStore';

const linkStore = useLinkStore();

</script>

<style scoped>
.header {
  width: 100%;
  border-bottom: 1px solid rgb(184, 184, 184);
  border-top: 1px solid rgb(184, 184, 184);
}

.header-nav {
  margin: 10px 20px;
  display: flex;
  justify-content: space-between;
}

.nav-item {
  width: 110px;
  border-radius: 10px;
  border: 1px solid black;
  text-decoration: none;
  color: black;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  padding: 5px 0;
  padding-bottom: 7px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
}

.nav-item.router-link-active {
  background-color: blue;
  color: white;
  cursor: default;
}

.nav-item.disabled {
  color: grey;
  pointer-events: none;
}
</style>