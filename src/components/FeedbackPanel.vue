<template>
  <div class="feedback-panel" :class="messageType">
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: String,
  messageType: String, // 'info', 'success', 'error'
});
</script>

<style scoped>
.feedback-panel {
  grid-area: feedback;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: bold;
  color: #fff;
}

.info {
  background-color: #007bff;
}

.success {
  background-color: #28a745;
}

.error {
  background-color: #dc3545;
}
</style>
