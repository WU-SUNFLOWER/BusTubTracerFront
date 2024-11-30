import { defineStore } from 'pinia';

export const useProcessDataStore = defineStore('process', {
    state: () => ({
        processData: null,
    }),
    actions: {
        setData(data: any) {
            this.processData = data;
        },
        getData() {
            if (this.processData === null || this.processData === void 0) {
                console.error("Invalid process infomation.");
            }
            return this.processData;
        },
    }
});