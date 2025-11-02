<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">CSV Viewer</h1>
        <p class="text-gray-600">Загрузка и просмотр CSV файлов с поддержкой больших объемов данных</p>
      </header>

      <Toast />

      <div v-if="!currentFile" class="mb-8">
        <FileUploadComponent @file-uploaded="handleFileUploaded" />
      </div>

      <div v-if="currentFile" class="space-y-6">
        <FileInfoComponent 
          :file="currentFile" 
          @close="handleFileClose"
        />
        <SearchComponent 
          :loading="searchLoading"
          @search="handleSearch"
          @clear="handleSearchClear"
        />
        <DataTableViewComponent 
          :file-id="currentFile.id"
          :headers="currentFile.headers"
          :search-query="searchQuery"
          :loading="tableLoading"
          @loading-change="tableLoading = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import FileUploadComponent from './components/FileUploadComponent.vue';
import FileInfoComponent from './components/FileInfoComponent.vue';
import SearchComponent from './components/SearchComponent.vue';
import DataTableViewComponent from './components/DataTableViewComponent.vue';

const toast = useToast();
const currentFile = ref(null);
const searchQuery = ref(null);
const searchLoading = ref(false);
const tableLoading = ref(false);

const handleFileUploaded = (fileData) => {
  currentFile.value = fileData;
  searchQuery.value = null;
  toast.add({
    severity: 'success',
    summary: 'Файл загружен',
    detail: `Загружено ${fileData.totalRows.toLocaleString()} строк`,
    life: 3000
  });
};

const handleFileClose = () => {
  currentFile.value = null;
  searchQuery.value = null;
  toast.add({
    severity: 'info',
    summary: 'Файл закрыт',
    detail: 'Вы можете загрузить новый файл',
    life: 2000
  });
};

const handleSearch = (query) => {
  searchQuery.value = query;
  searchLoading.value = true;
  setTimeout(() => {
    searchLoading.value = false;
  }, 500);
};

const handleSearchClear = () => {
  searchQuery.value = null;
};
</script>

