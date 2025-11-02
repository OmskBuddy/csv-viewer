<template>
  <Card class="shadow-md">
    <template #content>
      <div class="flex gap-2 items-center">
        <span class="p-input-icon-left flex-1">
          <i class="pi pi-search" />
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
          :disabled="loading || !searchText.trim()"
        />
        <Button
          v-if="searchText"
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

<script>
import { ref, watch } from 'vue';

export default {
  name: 'SearchComponent',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['search', 'clear'],
  setup(props, { emit }) {
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

    return {
      searchText,
      handleSearch,
      handleClear
    };
  }
};
</script>

