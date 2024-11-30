import { defineStore } from 'pinia';

export const useLinkStore = defineStore('links', {
    state: () => ({
        links: [
            { to: '/home',      label: 'Home',      enabled: true },
            { to: '/sqllogs',   label: 'SQL Logs',  enabled: true },
            { to: '/process',   label: 'Process',   enabled: false },
            { to: '/storage',   label: 'Storage',   enabled: true },
            { to: '/index',     label: 'Index',     enabled: true },
            { to: '/help',      label: 'Help',      enabled: true }
        ],
    }),
    actions: {
        disableLink(label: string) {
            const link = this.links.find((link) => link.label === label);
            if (link) {
                link.enabled = false;
            } else {
                console.error(`Can't find link ${label}`);
            }
        },
        enableLink(label: string) {
            const link = this.links.find((link) => link.label === label);
            if (link) {
                link.enabled = true;
            } else {
                console.error(`Can't find link ${label}`);
            }
        },
    }
});