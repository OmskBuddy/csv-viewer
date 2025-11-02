import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import ProgressBar from 'primevue/progressbar';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import Dialog from 'primevue/dialog';
import Card from 'primevue/card';

import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import './style.css';

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);

app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('FileUpload', FileUpload);
app.component('InputText', InputText);
app.component('Paginator', Paginator);
app.component('ProgressBar', ProgressBar);
app.component('Toast', Toast);
app.component('Dialog', Dialog);
app.component('Card', Card);

app.mount('#app');

