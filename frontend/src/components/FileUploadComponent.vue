<template>
  <Card class="shadow-lg">
    <template #content>
      <div class="text-center py-8">
        <i class="pi pi-cloud-upload text-6xl text-blue-500 mb-4"></i>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          Загрузите CSV файл
        </h2>
        <p class="text-gray-600 mb-6">
          Поддерживаются файлы размером до 100 МБ с количеством строк до 10^6
        </p>
        
        <FileUpload
          mode="basic"
          name="file"
          accept=".csv"
          :max-file-size="100000000"
          :auto="false"
          :custom-upload="true"
          @select="onFileSelect"
          chooseLabel="Выбрать файл"
          class="mb-4"
        />

        <div v-if="selectedFile" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">
            Выбранный файл: <strong>{{ selectedFile.name }}</strong>
          </p>
          <p class="text-xs text-gray-500 mb-4">
            Размер: {{ formatFileSize(selectedFile.size) }}
          </p>
          <div class="flex gap-2 justify-center">
            <Button
              label="Загрузить"
              icon="pi pi-upload"
              @click="handleUpload"
              :loading="uploading"
              :disabled="uploading"
            />
            <Button
              label="Отмена"
              severity="secondary"
              outlined
              @click="handleCancel"
              :disabled="uploading"
            />
          </div>
        </div>

        <ProgressBar
          v-if="uploading"
          :value="uploadProgress"
          class="mt-4"
        />
      </div>
    </template>
  </Card>
</template>

<script>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { csvService } from '../services/api';

export default {
  name: 'FileUploadComponent',
  emits: ['file-uploaded'],
  setup(props, { emit }) {
    const toast = useToast();
    const selectedFile = ref(null);
    const uploading = ref(false);
    const uploadProgress = ref(0);

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const onFileSelect = (event) => {
      if (event.files && event.files.length > 0) {
        selectedFile.value = event.files[0];
        uploadProgress.value = 0;
      }
    };

    const handleUpload = async () => {
      if (!selectedFile.value) {
        toast.add({
          severity: 'warn',
          summary: 'Ошибка',
          detail: 'Пожалуйста, выберите файл',
          life: 3000
        });
        return;
      }

      uploading.value = true;
      uploadProgress.value = 0;

      try {
        const fileData = await csvService.uploadFile(selectedFile.value);
        
        emit('file-uploaded', {
          id: fileData.fileId,
          headers: fileData.headers,
          totalRows: fileData.totalRows,
          fileName: selectedFile.value.name
        });

        selectedFile.value = null;
        uploadProgress.value = 100;
      } catch (error) {
        console.error('Upload error:', error);
        toast.add({
          severity: 'error',
          summary: 'Ошибка загрузки',
          detail: error.response?.data?.error || error.message || 'Не удалось загрузить файл',
          life: 5000
        });
      } finally {
        uploading.value = false;
        setTimeout(() => {
          uploadProgress.value = 0;
        }, 1000);
      }
    };

    const handleCancel = () => {
      selectedFile.value = null;
      uploadProgress.value = 0;
    };

    return {
      selectedFile,
      uploading,
      uploadProgress,
      formatFileSize,
      onFileSelect,
      handleUpload,
      handleCancel
    };
  }
};
</script>

