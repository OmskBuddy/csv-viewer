<template>
  <Card class="shadow-md">
    <template #content>
      <div class="flex gap-2 items-center">
        <span class="p-input-icon-left flex-1">
          <InputText
            v-model="searchText"
            placeholder="Введите текст для поиска..."
            class="w-full"
            :disabled="loading"
            @keyup.enter="handleSearch"
          />
        </span>
        <Button
          label="Поиск"
          icon="pi pi-search"
          @click="handleSearch"
          :loading="loading"
          :disabled="loading"
        />
        <Button
          label="Очистить"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClear"
          :disabled="loading"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['search', 'clear']);

const searchText = ref('');

const handleSearch = () => {
  if (searchText.value.trim()) {
    emit('search', searchText.value.trim());
  }
};

const handleClear = () => {
  searchText.value = '';
  emit('clear');
};

watch(() => props.loading, (newVal) => {
  if (!newVal && !searchText.value) {
    emit('clear');
  }
});
</script>

