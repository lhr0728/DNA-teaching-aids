<template>
  <div id="app">
    <h1>DNA 结构互动拼图</h1>
    <DnaPuzzler />
  </div>
</template>

<script setup>
import DnaPuzzler from './components/DnaPuzzler.vue'
</script>

<style>
#app {
  font-family: 'Microsoft YaHei', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  font-weight: bold;
}

h1 {
  margin-bottom: 20px;
}
</style>
