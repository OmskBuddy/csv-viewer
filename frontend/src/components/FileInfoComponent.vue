<template>
  <Card class="shadow-md">
    <template #content>
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">
            {{ file.fileName }}
          </h3>
          <div class="flex gap-4 text-sm text-gray-600">
            <span>
              <i class="pi pi-list mr-1"></i>
              Строк: <strong>{{ file.totalRows.toLocaleString() }}</strong>
            </span>
            <span>
              <i class="pi pi-table mr-1"></i>
              Колонок: <strong>{{ file.headers.length }}</strong>
            </span>
          </div>
        </div>
        <Button
          label="Закрыть файл"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="handleClose"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
defineProps({
  file: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

